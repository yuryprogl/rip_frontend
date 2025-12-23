// ==========================================
// 1. DOMAIN ENTITIES (Твои основные типы)
// ==========================================

export interface User {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean; // true = Профессор/Модератор
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
  status: number; // 1-Черновик, 2-Сформирован, 3-Завершен, 4-Отклонен
  status_name?: string; // Удобно для отображения

  date_created: string;
  date_formation: string | null;
  date_complete: string | null;

  owner: string; // Имя создателя
  moderator: string | null; // Имя модератора

  volume: number | null; // Поле пользователя (оно же "Поле по теме")

  // Новое поле из сериализатора (только для чтения, кол-во записей м-м)
  calculated_elements_count?: number;
}

export interface ElementForecastItem {
  id: number; // ID элемента (Element.id)
  name: string;
  formula: string;
  image: string | null;

  // Поля связи м-м (ElementForecast)
  temperature: number; // Вводимое поле
  weight: number | null; // Вычисляемое поле (результат)
}

export interface ForecastDetail {
  forecast: Forecast;
  elements: ElementForecastItem[];
}

export interface CartInfo {
  elements_count: number;
  draft_forecast: number | null;
}

export interface ForecastFilters {
  status?: string; // number в виде строки из select
  date_formation_start?: string;
  date_formation_end?: string;
}

// ==========================================
// 2. AI / VISUAL SEARCH (Для SigLIP)
// ==========================================

// Этот интерфейс нужен для хука useVisualSearch.
// Мы наследуем его от Element, чтобы он был совместим с твоими данными.
export interface AnomalyShortResponse extends Element {
  // Дополнительные поля для работы AI поиска
  embedding?: number[]; // Вектор, рассчитанный воркером

  // Алиас, если в компонентах поиска используется image_url вместо image
  // (но лучше использовать image как в Element)
  image_url?: string | null;

  // Поля, специфичные для карточки поиска (совместимость с mock-данными или логикой воркера)
  year?: number;
}

// Интерфейс для элемента в списке результатов поиска (с рейтингом)
export interface IProcessedAnomaly extends AnomalyShortResponse {
  score: number; // Процент сходства
  isVisible: boolean; // Фильтрация по порогу
}

// ==========================================
// 3. API & UI HELPERS
// ==========================================

export interface LoginResponse {
  token?: string;
  session_id?: string;
  user: User;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}
