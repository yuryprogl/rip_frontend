import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Badge,
  Form,
  Button,
  Row,
  Col,
  ButtonGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { fetchForecasts, adminStatusUpdate } from "../store/forecastSlice"; // Добавили adminStatusUpdate
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_MAP: Record<number, string> = {
  1: "Черновик",
  2: "В работе",
  3: "Завершен",
  4: "Отклонен",
  5: "Удален",
};

const getTodayISO = () => new Date().toISOString().split("T")[0];
const formatDateRU = (isoString: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString("ru-RU");
};

export default function ForecastsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, isLoading } = useSelector(
    (state: RootState) => state.forecasts
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Фильтры БЭКЕНДА
  const [statusFilter, setStatusFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  // Фильтр ФРОНТЕНДА (ЛР 8)
  const [creatorFilter, setCreatorFilter] = useState("");

  const loadData = () => {
    dispatch(
      fetchForecasts({
        status: statusFilter,
        date_formation_start: dateStart,
        date_formation_end: dateEnd,
      })
    );
  };

  // Short Polling (ЛР 8)
  useEffect(() => {
    loadData();
    let interval: any;
    // Если модератор - обновляем каждые 5 сек, чтобы увидеть результат от Go
    if (user?.is_superuser) interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [dispatch, user, statusFilter, dateStart, dateEnd]);

  const handleToday = () => {
    const today = getTodayISO();
    setDateStart(today);
    setDateEnd(today);
  };

  // Быстрое действие модератора из списка (ЛР 8)
  const handleQuickStatus = async (id: number, status: number) => {
    if (
      confirm(
        `Вы уверены, что хотите изменить статус на ${
          status === 3 ? "Завершен" : "Отклонен"
        }?`
      )
    ) {
      await dispatch(adminStatusUpdate({ id, status })).unwrap();
      loadData(); // Сразу обновляем список
    }
  };

  // Логика фильтрации на фронтенде по создателю
  const filteredList = list.filter((item) => {
    if (!user?.is_superuser) return true; // Обычный юзер видит только свои (фильтр бека)
    if (!creatorFilter) return true; // Фильтр пустой
    return item.owner.toLowerCase().includes(creatorFilter.toLowerCase());
  });

  if (isLoading && list.length === 0) return <LoadingSpinner />;

  return (
    <Container className="py-4">
      <h2>
        {user?.is_superuser ? "Все прогнозы (Модерация)" : "Мои прогнозы"}
      </h2>

      {/* Панель фильтров */}
      <Row className="mb-3 align-items-end g-2">
        <Col md={2}>
          <Form.Label>Статус</Form.Label>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Все</option>
            <option value="2">В работе</option>
            <option value="3">Завершен</option>
            <option value="4">Отклонен</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Label>Дата с</Form.Label>
          <Form.Control
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Дата по</Form.Label>
          <Form.Control
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
          />
        </Col>

        {/* Фильтр по создателю (Только для модератора, Фронтенд) */}
        {user?.is_superuser && (
          <Col md={2}>
            <Form.Label>Создатель (Фронт)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Логин..."
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
            />
          </Col>
        )}

        <Col md="auto">
          <Button variant="outline-primary" onClick={handleToday}>
            За сегодня
          </Button>
        </Col>
        <Col md="auto">
          <Button onClick={loadData}>Обновить</Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Дата форм.</th>
            <th>Статус</th>
            {user?.is_superuser && <th>Создатель</th>}
            {user?.is_superuser && <th>По теме (Объем)</th>}
            {user?.is_superuser && <th>Рассчитано</th>}
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.date_formation ? formatDateRU(f.date_formation) : "-"}</td>
              <td>
                <Badge
                  bg={
                    f.status === 2
                      ? "primary"
                      : f.status === 3
                      ? "success"
                      : f.status === 4
                      ? "warning"
                      : "secondary"
                  }
                >
                  {STATUS_MAP[f.status]}
                </Badge>
              </td>
              {user?.is_superuser && <td>{f.owner}</td>}
              {user?.is_superuser && <td>{f.volume ? `${f.volume}` : "-"}</td>}

              {/* ЛР 8: Поле, которое заполняется асинхронно */}
              {user?.is_superuser && (
                <td
                  className={
                    f.calculated_elements_count &&
                    f.calculated_elements_count > 0
                      ? "text-success fw-bold"
                      : "text-muted"
                  }
                >
                  {f.calculated_elements_count ?? 0} шт.
                </td>
              )}

              <td>
                <div className="d-flex gap-2">
                  <Link
                    to={`/forecasts/${f.id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Открыть
                  </Link>

                  {/* ЛР 8: Кнопки действий прямо в списке для Модератора */}
                  {user?.is_superuser && f.status === 2 && (
                    <ButtonGroup size="sm">
                      <Button
                        variant="success"
                        onClick={() => handleQuickStatus(f.id, 3)}
                        title="Завершить"
                      >
                        ✓
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleQuickStatus(f.id, 4)}
                        title="Отклонить"
                      >
                        ✗
                      </Button>
                    </ButtonGroup>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
