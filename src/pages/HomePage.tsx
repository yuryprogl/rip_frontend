// src/pages/HomePage.tsx

import { Link } from "react-router-dom";
import { ROUTES } from "../Routes";
import { Button, Container } from "react-bootstrap";

export default function HomePage() {
  return (
    // Используем классы Bootstrap для центрирования контента по вертикали и горизонтали
    <Container
      className="d-flex flex-column justify-content-center text-center"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      <h1 className="display-3 fw-bold">Прогноз растворимости осадка</h1>
      <p className="lead my-4 text-muted">
        Веб-приложение для анализа и прогнозирования растворимости химических
        элементов.
      </p>
      <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
        <Button as={Link} to={ROUTES.ELEMENTS} variant="primary" size="lg">
          Перейти к списку элементов
        </Button>
      </div>
    </Container>
  );
}
