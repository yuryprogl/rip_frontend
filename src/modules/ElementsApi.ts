import type { Element, CartInfo } from "./ElementsTypes";
import { ELEMENTS_MOCK } from "./mock";

// ... (функции listElements и getElement остаются без изменений) ...

export async function listElements(nameFilter?: string): Promise<Element[]> {
  try {
    const params = new URLSearchParams();
    if (nameFilter) {
      params.append("element_name", nameFilter);
    }
    const url = `/api/elements/?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("API request failed. Falling back to mock data.", error);
    if (nameFilter) {
      return ELEMENTS_MOCK.filter((element) =>
        element.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    return ELEMENTS_MOCK;
  }
}

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
    return ELEMENTS_MOCK.find((element) => element.id === id) || null;
  }
}

// Старая функция (оставляем для истории или если понадобится реальная корзина)
export async function getCartInfo(): Promise<CartInfo> {
  try {
    const response = await fetch("/api/forecasts/cart/");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("Cart API request failed. Falling back to mock data.", error);
    return { elements_count: 0, draft_forecast: null };
  }
}

// --- НОВАЯ ФУНКЦИЯ ---
export async function getCartInfoMock(): Promise<CartInfo> {
  try {
    // Обращаемся к новому эндпоинту
    const response = await fetch("/api/forecasts/cart/mock/");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Cart MOCK API request failed.", error);
    // Возвращаем нули при ошибке
    return { elements_count: 0, draft_forecast: 0 };
  }
}
