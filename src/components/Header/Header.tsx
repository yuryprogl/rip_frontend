// src/components/Header/Header.tsx
import { Container, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ROUTES } from "../../Routes";

export default function Header() {
  return (
    <Navbar expand="lg" sticky="top" className="app-header" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to={ROUTES.HOME}>
          Прогноз растворимости
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={ROUTES.HOME}>
              Главная
            </Nav.Link>
            <Nav.Link as={Link} to={ROUTES.ELEMENTS}>
              Элементы
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
