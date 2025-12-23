import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Button,
  ProgressBar,
  Card,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useVisualSearch } from "../hooks/useVisualSearch";
import { Api } from "../api/Api";
import type { AnomalyShortResponse } from "../types";
import BreadCrumbs from "../components/BreadCrumbs/BreadCrumbs";
// ИСПРАВЛЕНО: Импортируем существующую картинку из assets
import defaultImage from "../assets/default-image.png";

export default function VisualSearchPage() {
  const [initialItems, setInitialItems] = useState<AnomalyShortResponse[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await Api.anomaliesList({});
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data as any).anomalies;
        setInitialItems(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const { items, ready, progress, imageEmbedding, searchByImage, resetSearch } =
    useVisualSearch(initialItems);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      searchByImage(file);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    resetSearch();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadLabel = ready
    ? "Загрузить фото для поиска"
    : `Загрузка модели (${Math.round(progress)}%)...`;
  const isUploadDisabled = !ready;
  const canReset = Boolean(selectedImage);

  if (loadingData) {
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="page-container py-4">
      <BreadCrumbs crumbs={[{ label: "AI Поиск" }]} />

      <div className="text-center mb-5 mt-3">
        <h1>🔍 Мультимодальный поиск</h1>
        <p className="text-muted">
          Найдите аномалии по загруженной фотографии с помощью нейросети SigLIP
        </p>
      </div>

      {/* Панель поиска */}
      <Card
        className="mb-5 shadow-sm"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <Card.Body>
          <div className="d-flex flex-column flex-md-row gap-4 align-items-center justify-content-center">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            <div
              style={{
                width: 150,
                height: 150,
                border: "2px dashed #6c757d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                overflow: "hidden",
                background: "#343a40",
              }}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Query"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span className="text-muted">Нет фото</span>
              )}
            </div>

            <div className="d-flex flex-column gap-3" style={{ minWidth: 300 }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadDisabled}
              >
                {uploadLabel}
              </Button>

              {!ready && progress > 0 && (
                <ProgressBar
                  now={progress}
                  animated
                  variant="info"
                  style={{ height: 10 }}
                />
              )}

              {imageEmbedding && (
                <Alert
                  variant="success"
                  className="py-2 m-0 text-truncate"
                  style={{ fontSize: "0.8rem" }}
                >
                  <strong>Вектор построен!</strong> Размерность: 768
                </Alert>
              )}

              <Button
                variant="outline-danger"
                onClick={handleClear}
                disabled={!canReset}
              >
                Сбросить поиск
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Результаты */}
      <div className="anomalies-grid d-flex flex-column gap-3">
        {items.map((item) => {
          if (!item.isVisible) return null;

          // Обработка картинки для отображения
          let imgUrl = item.image || defaultImage; // Используем поле image как в типе Element

          // Фикс для локалхоста/minio
          if (imgUrl && imgUrl.startsWith("http")) {
            try {
              const urlObj = new URL(imgUrl);
              imgUrl = urlObj.pathname;
            } catch (e) {}
          }

          return (
            <Card
              key={item.id}
              className="shadow-sm"
              style={{
                flexDirection: "row",
                minHeight: 120,
                overflow: "hidden",
              }}
            >
              <div style={{ width: 150, flexShrink: 0 }}>
                <img
                  src={imgUrl}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src = defaultImage)
                  }
                />
              </div>

              <Card.Body className="d-flex flex-column justify-content-center">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="mb-1">{item.name}</h5>
                  {item.score > 0 && (
                    <Badge bg={item.score > 0.1 ? "success" : "info"}>
                      Сходство: {(item.score * 100).toFixed(1)}%
                    </Badge>
                  )}
                </div>
                {/* <p className="text-muted mb-2">Формула: {item.formula}</p> */}

                {item.embedding && (
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                    Эмбеддинг текста посчитан [
                    {item.embedding
                      .slice(0, 3)
                      .map((n) => n.toFixed(2))
                      .join(", ")}
                    ...]
                  </small>
                )}
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && ready && (
        <div className="text-center mt-5 text-muted">Список пуст</div>
      )}
    </Container>
  );
}
