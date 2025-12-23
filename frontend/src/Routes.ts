export const ROUTES = {
  HOME: "/",
  ELEMENTS: "/elements",
  ELEMENT: "/elements/:id", // Динамический путь для конкретного элемента
  VISUAL_SEARCH: "/visual-search",
};

export type RouteKeyType = keyof typeof ROUTES;

// Метки для "хлебных крошек" и заголовков
export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  HOME: "Главная",
  ELEMENTS: "Элементы",
  ELEMENT: "Элемент",
  VISUAL_SEARCH: "Визуальный поиск",
};
