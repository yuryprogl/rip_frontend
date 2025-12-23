import { Container, Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { logoutUser } from "../../store/authSlice";
import { fetchCart } from "../../store/cartSlice";
import { useEffect } from "react";
// Убедись, что иконка есть, или убери img временно
// import cartIcon from "../../assets/cart.svg";

export default function Header() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { count, draftId } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const goToCart = () => {
    if (draftId) navigate(`/forecasts/${draftId}`);
    else navigate("/forecasts");
  };

  return (
    <Navbar expand="lg" sticky="top" className="app-header" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Прогноз растворимости
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/elements">
              Элементы
            </Nav.Link>
            <Nav.Link as={Link} to="/visual-search" className="nav-link-custom">
              AI Поиск
            </Nav.Link>
            {isAuthenticated && (
              <Nav.Link as={Link} to="/forecasts">
                {user?.is_superuser ? "Все прогнозы" : "Мои прогнозы"}
              </Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-center gap-3">
            {/* Не показываем кнопки, пока идет проверка авторизации */}
            {!isLoading &&
              (isAuthenticated ? (
                <>
                  {!user?.is_superuser && (
                    <Button variant="primary" onClick={goToCart}>
                      Прогноз
                      {count > 0 && (
                        <span className="ms-2 badge bg-danger">{count}</span>
                      )}
                    </Button>
                  )}

                  <Dropdown align="end">
                    <Dropdown.Toggle variant="outline-light">
                      {user?.username}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} to="/profile">
                        Личный кабинет
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout}>
                        Выход
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              ) : (
                <Button as={Link} to="/login" variant="light">
                  Войти
                </Button>
              ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
