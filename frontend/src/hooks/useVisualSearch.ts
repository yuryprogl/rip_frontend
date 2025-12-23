import { useState, useRef, useEffect } from "react";
import { cosineSimilarity } from "../modules/math";
import type { AnomalyShortResponse } from "../types";

// Расширяем интерфейс для UI (добавляем score и видимость)
export interface IProcessedAnomaly extends AnomalyShortResponse {
  score: number;
  isVisible: boolean;
  embedding?: number[];
  description?: string; // Добавляем, так как в short response его может не быть
}

export const useVisualSearch = (initialItems: AnomalyShortResponse[]) => {
  const [items, setItems] = useState<IProcessedAnomaly[]>([]);

  // При изменении входных данных обновляем стейт, но сохраняем эмбеддинги если были
  useEffect(() => {
    setItems((prev) => {
      return initialItems.map((item) => {
        const existing = prev.find((p) => p.id === item.id);
        return {
          ...item,
          score: existing?.score || 0,
          isVisible: true,
          embedding: existing?.embedding,
        };
      });
    });
  }, [initialItems]); // Внимание: это сработает при загрузке страницы

  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const workerRef = useRef<Worker | null>(null);

  // 1. Инициализация и получение текстовых векторов
  useEffect(() => {
    // Запуск воркера
    workerRef.current = new Worker(
      new URL("../workers/search.worker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data;

      switch (type) {
        case "progress":
          // Обработка прогресса загрузки модели
          if (data.status === "progress") {
            setProgress(data.progress);
          } else if (data.status === "ready") {
            // Модель загружена, но еще может идти расчет векторов
          }
          break;

        case "text_embeddings_ready":
          setItems((prev) =>
            prev.map((item) => ({
              ...item,
              embedding: data[item.id],
            }))
          );
          setReady(true);
          console.log("Text embeddings calculated!");
          break;

        case "image_embedding_ready":
          setImageEmbedding(data);
          break;

        case "error":
          console.error("Worker Error:", data);
          break;
      }
    };

    // Отправляем данные для инициализации (расчета текстовых векторов)
    if (initialItems.length > 0) {
      workerRef.current.postMessage({ type: "init", data: initialItems });
    }

    return () => workerRef.current?.terminate();
  }, [initialItems.length]); // Перезапуск только если длина массива изменилась (загрузились данные)

  // 2. Логика поиска и сортировки (срабатывает, когда появляется вектор картинки)
  useEffect(() => {
    if (!imageEmbedding) return;

    setItems((prevItems) => {
      // Если вектора описаний еще не посчитаны
      if (!prevItems.length || !prevItems[0].embedding) return prevItems;

      // Порог схожести (SigLIP выдает значения около 0, поэтому порог маленький)
      const threshold = 0.005;

      const processed = prevItems.map((item) => {
        if (!item.embedding) return item;

        const similarity = cosineSimilarity(imageEmbedding, item.embedding);

        return {
          ...item,
          score: similarity,
          isVisible: similarity > threshold,
        };
      });

      // Сортировка по убыванию рейтинга
      processed.sort((a, b) => b.score - a.score);

      return processed;
    });
  }, [imageEmbedding]);

  // 3. Методы управления
  const searchByImage = (file: File) => {
    workerRef.current?.postMessage({ type: "image", data: file });
  };

  const resetSearch = () => {
    setImageEmbedding(null);
    // Сброс: возвращаем исходный порядок (по ID), обнуляем score
    setItems((prev) => {
      const sortedById = [...prev].sort((a, b) => (a.id || 0) - (b.id || 0));
      return sortedById.map((item) => ({
        ...item,
        score: 0,
        isVisible: true,
      }));
    });
  };

  return {
    items,
    ready,
    progress,
    imageEmbedding,
    searchByImage,
    resetSearch,
  };
};
