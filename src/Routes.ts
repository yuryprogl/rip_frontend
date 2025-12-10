export const ROUTES = {
  HOME: "/",
  ELEMENTS: "/elements",
  ELEMENT: "/elements/:id", // Динамический путь для конкретного элемента
};

export type RouteKeyType = keyof typeof ROUTES;

// Метки для "хлебных крошек" и заголовков
export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  HOME: "Главная",
  ELEMENTS: "Элементы",
  ELEMENT: "Элемент",
};
