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

// Экспортируем объект api с маленькой буквы
export const Api = {
  // =======================================
  // ЭЛЕМЕНТЫ (АНОМАЛИИ)
  // =======================================

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

  // --- СПЕЦИАЛЬНЫЙ МЕТОД ДЛЯ VISUAL SEARCH ---
  // Этот метод нужен, чтобы страница VisualSearchPage не ругалась.
  // Мы просто перенаправляем его на getElements.
  async anomaliesList(params?: { name?: string }) {
    return this.getElements(params?.name);
  },

  // =======================================
  // ПРОГНОЗЫ (FORECASTS)
  // =======================================

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
    return $api.put<Forecast>(`/forecasts/${id}/update_status_user/`);
  },

  async deleteForecast(id: number) {
    return $api.delete(`/forecasts/${id}/delete/`);
  },

  // --- Вложенные элементы прогноза ---
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

  // Группировка forecasts для совместимости с новыми страницами (если используется api.forecasts.list)
  forecasts: {
    list: (filters?: ForecastFilters) => api.getForecasts(filters),
    detail: (id: number) => api.getForecastById(id),
    cart: () => api.getCartInfo(),
    update: (id: number, data: { volume: number }) =>
      api.updateForecast(id, data),
    submit: (id: number) => api.submitForecast(id),
    delete: (id: number) => api.deleteForecast(id),
    removeElement: (fId: number, eId: number) =>
      api.deleteElementFromForecast(fId, eId),
    updateElement: (fId: number, eId: number, data: { temperature: number }) =>
      api.updateElementInForecast(fId, eId, data),
  },

  // =======================================
  // МОДЕРАТОР
  // =======================================
  async updateStatusAdmin(id: number, status: number) {
    return $api.put<Forecast>(`/forecasts/${id}/update_status_admin/`, {
      status,
    });
  },

  // =======================================
  // АВТОРИЗАЦИЯ (AUTH)
  // =======================================
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

  // Группировка auth для совместимости (api.auth.login)
  auth: {
    login: (data: any) => api.login(data),
    register: (data: any) => api.register(data),
    logout: () => api.logout(),
    getMe: () => api.getMe(),
    updateProfile: (data: any) => api.updateProfile(data),
  },
};
