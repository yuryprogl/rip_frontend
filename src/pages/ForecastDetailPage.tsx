import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import {
  fetchForecastDetail,
  setLocalVolume,
  setLocalTemperature,
  saveForecastVolume,
  saveElementTemperature,
  removeElement,
  submitForecast,
  deleteForecast,
  adminStatusUpdate,
} from "../store/forecastSlice";
import { fetchCart } from "../store/cartSlice";

export default function ForecastDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { current, localData, isLoading, error } = useSelector(
    (state: RootState) => state.forecasts
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (id) dispatch(fetchForecastDetail(parseInt(id)));
  }, [id, dispatch]);

  if (!current) return <div>Загрузка...</div>;

  const { forecast, elements } = current;
  const isDraft = forecast.status === 1;
  const isOwner = user?.username === forecast.owner;
  const isModerator = user?.is_superuser;
  const isSubmitted = forecast.status === 2; // "В работе"

  // Обработчики
  const handleVolumeBlur = () => {
    if (localData.volume !== String(forecast.volume)) {
      dispatch(
        saveForecastVolume({
          id: forecast.id,
          volume: Number(localData.volume),
        })
      );
    }
  };

  const handleTempBlur = (elementId: number) => {
    dispatch(
      saveElementTemperature({
        forecastId: forecast.id,
        elementId,
        temperature: Number(localData.temperatures[elementId]),
      })
    );
  };

  const handleSubmit = async () => {
    // Валидация
    if (!forecast.volume) {
      alert("Введите объем!");
      return;
    }
    await dispatch(submitForecast(forecast.id));
    dispatch(fetchCart()); // Обновить корзину (она исчезнет)
    navigate("/forecasts");
  };

  const handleDelete = async () => {
    if (confirm("Удалить черновик?")) {
      await dispatch(deleteForecast(forecast.id));
      dispatch(fetchCart());
      navigate("/elements");
    }
  };

  const handleAdminAction = async (status: number) => {
    await dispatch(adminStatusUpdate({ id: forecast.id, status }));
    navigate("/forecasts");
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Прогноз №{forecast.id}</h1>
        <h3>
          Статус:{" "}
          {forecast.status === 1
            ? "Черновик"
            : forecast.status === 3
            ? "Завершен"
            : "В обработке"}
        </h3>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Блок основной информации */}
      <Card className="mb-4 p-3">
        <Form.Group as={Row}>
          <Form.Label column sm={2}>
            Объем раствора (мл):
          </Form.Label>
          <Col sm={4}>
            <Form.Control
              type="number"
              value={localData.volume}
              onChange={(e) => dispatch(setLocalVolume(e.target.value))}
              onBlur={handleVolumeBlur}
              disabled={!isDraft}
            />
          </Col>
          {forecast.status === 3 && (
            <Col
              sm={4}
              className="text-success fw-bold d-flex align-items-center"
            >
              Расчет завершен{" "}
              {new Date(forecast.date_complete!).toLocaleDateString()}
            </Col>
          )}
        </Form.Group>
      </Card>

      {/* Список элементов */}
      <h4>Элементы в составе:</h4>
      <Table bordered>
        <thead>
          <tr>
            <th>Элемент</th>
            <th>Формула</th>
            <th>Температура (°C)</th>
            {forecast.status === 3 && <th>Масса осадка (г) [Результат]</th>}
            {isDraft && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {elements.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.formula}</td>
              <td>
                <Form.Control
                  type="number"
                  value={localData.temperatures[item.id] || ""}
                  onChange={(e) =>
                    dispatch(
                      setLocalTemperature({
                        id: item.id,
                        val: e.target.value,
                      })
                    )
                  }
                  onBlur={() => handleTempBlur(item.id)}
                  disabled={!isDraft}
                  style={{ maxWidth: "100px" }}
                />
              </td>
              {forecast.status === 3 && (
                <td className="fw-bold text-primary">
                  {item.weight ? item.weight.toFixed(4) : "Ошибка расчета"}
                </td>
              )}
              {isDraft && (
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      dispatch(
                        removeElement({
                          forecastId: forecast.id,
                          elementId: item.id,
                        })
                      )
                    }
                  >
                    Удалить
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Кнопки действий */}
      <div className="mt-4 d-flex gap-3">
        {isDraft && isOwner && (
          <>
            <Button variant="success" size="lg" onClick={handleSubmit}>
              Сформировать прогноз
            </Button>
            <Button variant="outline-danger" onClick={handleDelete}>
              Удалить черновик
            </Button>
          </>
        )}

        {isModerator && isSubmitted && (
          <>
            <Button variant="success" onClick={() => handleAdminAction(3)}>
              Завершить (Рассчитать)
            </Button>
            <Button variant="danger" onClick={() => handleAdminAction(4)}>
              Отклонить
            </Button>
          </>
        )}
      </div>
    </Container>
  );
}
