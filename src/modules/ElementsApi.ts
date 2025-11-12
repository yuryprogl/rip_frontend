import type { Element, CartInfo } from "./ElementsTypes"; // Добавляем CartInfo
import { ELEMENTS_MOCK } from "./mock";

/**
 * Получает список всех элементов с возможностью фильтрации.
 * При ошибке запроса к API возвращает mock-данные.
 * @param nameFilter - Строка для фильтрации по имени.
 */
export async function listElements(nameFilter?: string): Promise<Element[]> {
  try {
    const params = new URLSearchParams();
    // API ожидает параметр 'element_name'
    if (nameFilter) {
      params.append("element_name", nameFilter);
    }

    // Запрос будет перенаправлен прокси-сервером Vite
    const url = `/api/elements/?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      // Если сервер вернул ошибку (4xx, 5xx), генерируем исключение, чтобы перейти в блок catch
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("API request failed. Falling back to mock data.", error);

    // Логика fallback'а: фильтруем mock-данные, если был поисковый запрос
    if (nameFilter) {
      return ELEMENTS_MOCK.filter((element) =>
        element.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    return ELEMENTS_MOCK;
  }
}

/**
 * Получает один элемент по ID.
 * При ошибке запроса к API ищет элемент в mock-данных.
 * @param id - ID элемента.
 */
export async function getElement(id: number): Promise<Element | null> {
  try {
    const response = await fetch(`/api/elements/${id}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(
      `API request for GET element ID:${id} failed. Falling back to mock data.`,
      error
    );
    // При любой ошибке ищем в mock-данных
    return ELEMENTS_MOCK.find((element) => element.id === id) || null;
  }
}

export async function getCartInfo(): Promise<CartInfo> {
  try {
    const response = await fetch("/api/forecasts/cart/");
    if (!response.ok) {
      // Аутентификация не реализована, поэтому ошибка 401/403 ожидаема.
      // Мы просто перейдем в блок catch и вернем mock.
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("Cart API request failed. Falling back to mock data.", error);
    // Возвращаем mock-объект, если API недоступно или требует авторизации
    return { elements_count: 0, draft_forecast: null };
  }
}
