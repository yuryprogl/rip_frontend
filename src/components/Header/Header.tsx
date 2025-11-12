// src/components/Header/Header.tsx
import { Container, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ROUTES } from "../../Routes";

export default function Header() {
  return (
    <Navbar expand="lg" sticky="top" className="app-header">
      <Container>
        {/* Используем Link вместо LinkContainer для простоты */}
        <Navbar.Brand as={Link} to={ROUTES.HOME}>
          Прогноз растворимости осадка
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}
