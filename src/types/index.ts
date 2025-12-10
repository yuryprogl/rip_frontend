export interface User {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
}

export interface Element {
  id: number;
  name: string;
  description: string;
  formula: string;
  status: number; // 1 - действует, 2 - удален
  image: string | null;
}

export interface Forecast {
  id: number;
  status: number; // 1-Черновик, 2-В работе, 3-Завершен, 4-Отклонен
  status_name?: string; // Для удобства фронта
  date_created: string;
  date_formation: string | null;
  date_complete: string | null;
  owner: string; // Имя пользователя
  moderator: string | null;
  volume: number | null; // Поле пользователя
}

export interface ElementForecastItem {
  id: number; // Используем как ID для ключей
  name: string;
  formula: string;
  image: string | null;
  // Поля связи м-м
  temperature: number; // Вводимое
  weight: number | null; // Вычисляемое
}

export interface ForecastDetail {
  forecast: Forecast;
  elements: ElementForecastItem[];
}

export interface CartInfo {
  elements_count: number;
  draft_forecast: number | null;
}

// Фильтры
export interface ForecastFilters {
  status?: string;
  date_formation_start?: string;
  date_formation_end?: string;
}
