import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Badge,
  Form,
  Button,
  Row,
  Col,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { fetchForecasts } from "../store/forecastSlice";
import LoadingSpinner from "../components/LoadingSpinner"; // Возьми из примера или сделай простой

const STATUS_MAP: Record<number, string> = {
  1: "Черновик",
  2: "В работе",
  3: "Завершен",
  4: "Отклонен",
  5: "Удален",
};

export default function ForecastsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, isLoading } = useSelector(
    (state: RootState) => state.forecasts
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [statusFilter, setStatusFilter] = useState("");

  // Для модератора поллинг
  useEffect(() => {
    const load = () => dispatch(fetchForecasts({ status: statusFilter }));
    load();

    let interval: any;
    if (user?.is_superuser) {
      interval = setInterval(load, 5000);
    }
    return () => clearInterval(interval);
  }, [dispatch, user, statusFilter]);

  if (isLoading && list.length === 0) return <LoadingSpinner />;

  return (
    <Container className="py-4">
      <h2>
        {user?.is_superuser ? "Все прогнозы (Модерация)" : "Мои прогнозы"}
      </h2>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Все статусы</option>
            <option value="2">В работе (Сформирован)</option>
            <option value="3">Завершен</option>
            <option value="4">Отклонен</option>
          </Form.Select>
        </Col>
        <Col>
          <Button
            onClick={() => dispatch(fetchForecasts({ status: statusFilter }))}
          >
            Обновить
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Дата создания</th>
            <th>Дата формирования</th>
            <th>Статус</th>
            {user?.is_superuser && <th>Создатель</th>}
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {list.map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{new Date(f.date_created).toLocaleDateString()}</td>
              <td>
                {f.date_formation
                  ? new Date(f.date_formation).toLocaleDateString()
                  : "-"}
              </td>
              <td>
                <Badge
                  bg={
                    f.status === 2
                      ? "primary"
                      : f.status === 3
                      ? "success"
                      : "secondary"
                  }
                >
                  {STATUS_MAP[f.status]}
                </Badge>
              </td>
              {user?.is_superuser && <td>{f.owner}</td>}
              <td>
                <Link
                  to={`/forecasts/${f.id}`}
                  className="btn btn-sm btn-outline-primary"
                >
                  Открыть
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
