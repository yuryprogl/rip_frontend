import $api from "./index";
import type {
  User,
  Element,
  Forecast,
  ForecastDetail,
  CartInfo,
  ForecastFilters,
  ElementForecastItem,
} from "../types";

export const Api = {
  // --- Элементы ---
  async getElements(nameFilter?: string) {
    const params = new URLSearchParams();
    if (nameFilter) params.append("element_name", nameFilter);
    return $api.get<Element[]>(`/elements/?${params.toString()}`);
  },

  async getElement(id: number) {
    return $api.get<Element>(`/elements/${id}/`);
  },

  async addToForecast(elementId: number) {
    return $api.post<ElementForecastItem[]>(
      `/elements/${elementId}/add_to_forecast/`
    );
  },

  // --- Прогнозы (Заявки) ---
  async getForecasts(filters?: ForecastFilters) {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.date_formation_start)
      params.append("date_formation_start", filters.date_formation_start);
    if (filters?.date_formation_end)
      params.append("date_formation_end", filters.date_formation_end);

    return $api.get<Forecast[]>(`/forecasts/?${params.toString()}`);
  },

  async getCartInfo() {
    return $api.get<CartInfo>("/forecasts/cart/");
  },

  async getForecastById(id: number) {
    return $api.get<ForecastDetail>(`/forecasts/${id}/`);
  },

  async updateForecast(id: number, data: { volume: number }) {
    return $api.put<Forecast>(`/forecasts/${id}/update/`, data);
  },

  async submitForecast(id: number) {
    // Пользователь формирует заявку (статус 1 -> 2)
    // Твой бекенд требует volume, но мы его сохраняем отдельным методом updateForecast перед отправкой
    return $api.put<Forecast>(`/forecasts/${id}/update_status_user/`);
  },

  async deleteForecast(id: number) {
    return $api.delete(`/forecasts/${id}/delete/`);
  },

  // --- Элементы внутри прогноза (М-М) ---
  async updateElementInForecast(
    forecastId: number,
    elementId: number,
    data: { temperature: number }
  ) {
    return $api.put(
      `/forecasts/${forecastId}/update_element/${elementId}/`,
      data
    );
  },

  async deleteElementFromForecast(forecastId: number, elementId: number) {
    return $api.delete<ElementForecastItem[]>(
      `/forecasts/${forecastId}/delete_element/${elementId}/`
    );
  },

  // --- Модератор ---
  async updateStatusAdmin(id: number, status: number) {
    // 3 - завершить, 4 - отклонить
    return $api.put<Forecast>(`/forecasts/${id}/update_status_admin/`, {
      status,
    });
  },

  // --- Auth ---
  async login(data: any) {
    return $api.post<User>("/users/login/", data);
  },

  async register(data: any) {
    return $api.post<User>("/users/register/", data);
  },

  async logout() {
    return $api.post("/users/logout/");
  },

  async getMe() {
    return $api.get<User>("/users/info/");
  },

  async updateProfile(data: any) {
    return $api.put<User>("/users/update/", data);
  },
};
