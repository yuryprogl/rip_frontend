import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"; // Импортируем хук навигации
import type { RootState, AppDispatch } from "../store/store";
import { Api } from "../api/Api";
import { checkAuth } from "../store/authSlice";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // Хук для перенаправления

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState<{
    type: "success" | "danger";
    msg: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // ГЛАВНОЕ ИСПРАВЛЕНИЕ:
  // Если загрузка прошла, а пользователя нет - отправляем на Логин
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Заполняем поля, когда пользователь загрузился
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setUsername(user.username || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const dataToUpdate: any = { username, email };
      if (password) dataToUpdate.password = password;

      await Api.updateProfile(dataToUpdate);
      await dispatch(checkAuth());

      setStatus({ type: "success", msg: "Профиль сохранен" });
      setPassword("");
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Ошибка сохранения";
      setStatus({ type: "danger", msg: `Ошибка: ${errorMsg}` });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  // Если пользователя нет, ничего не рендерим (ждем редиректа)
  if (!user) return null;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Личный кабинет</h4>
            </Card.Header>
            <Card.Body>
              {status && <Alert variant={status.type}>{status.msg}</Alert>}

              <Form onSubmit={handleSubmit}>
                <h5 className="mb-3">Личные данные</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Логин</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <hr />
                <h5 className="mb-3">Безопасность</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Сменить пароль</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите новый пароль (необязательно)"
                    autoComplete="new-password"
                  />
                  <Form.Text className="text-muted">
                    Оставьте пустым, если не хотите менять.
                  </Form.Text>
                </Form.Group>

                <div className="d-grid gap-2 mt-4">
                  <Button variant="success" type="submit" disabled={saving}>
                    {saving ? "Сохранение..." : "Сохранить изменения"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
