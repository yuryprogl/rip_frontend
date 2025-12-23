import { useEffect, useState } from "react";
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
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import {
  fetchForecastDetail,
  saveForecastVolume,
  saveElementTemperature,
  removeElement,
  submitForecast,
  deleteForecast,
  adminStatusUpdate,
} from "../store/forecastSlice";
import { fetchCart } from "../store/cartSlice";
import LoadingSpinner from "../components/LoadingSpinner";

// Формат даты РФ
const formatDateRU = (dateString: string | null): string => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("ru-RU");
  } catch (e) {
    return dateString;
  }
};

export default function ForecastDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { current, isLoading, error } = useSelector(
    (state: RootState) => state.forecasts
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Локальные стейты для инпутов
  const [localVolume, setLocalVolumeState] = useState<string>("");
  const [localTemperatures, setLocalTemperatures] = useState<
    Record<number, string>
  >({});

  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchForecastDetail(parseInt(id)));
  }, [id, dispatch]);

  useEffect(() => {
    if (current) {
      setLocalVolumeState(
        current.forecast.volume !== null ? String(current.forecast.volume) : ""
      );
      const temps: Record<number, string> = {};
      current.elements.forEach((item) => {
        temps[item.id] =
          item.temperature !== null ? String(item.temperature) : "";
      });
      setLocalTemperatures(temps);
    }
  }, [current]);

  if (isLoading || !current) return <LoadingSpinner />;

  const { forecast, elements } = current;
  const isDraft = forecast.status === 1;
  const isOwner = user?.username === forecast.owner;
  const isModerator = user?.is_superuser;

  // --- КНОПКА 1: Сохранить поля заявки (Объем) ---
  const handleSaveVolume = async () => {
    if (!localVolume) {
      setToastMsg("Введите объем.");
      setShowToast(true);
      return;
    }
    try {
      await dispatch(
        saveForecastVolume({ id: forecast.id, volume: Number(localVolume) })
      ).unwrap();
      setToastMsg("Поля заявки сохранены.");
      setShowToast(true);
      dispatch(fetchForecastDetail(forecast.id));
    } catch (err: any) {
      setToastMsg("Ошибка сохранения.");
      setShowToast(true);
    }
  };

  // --- КНОПКА 2: Сохранить  (Температура) ---
  const handleSaveTemperature = async (elementId: number) => {
    const val = localTemperatures[elementId];
    if (!val) return;
    try {
      await dispatch(
        saveElementTemperature({
          forecastId: forecast.id,
          elementId,
          temperature: Number(val),
        })
      ).unwrap();
      setToastMsg(" сохранено.");
      setShowToast(true);
      dispatch(fetchForecastDetail(forecast.id));
    } catch (err: any) {
      setToastMsg("Ошибка сохранения .");
      setShowToast(true);
    }
  };

  // --- КНОПКА 3: Удалить  (Удалить элемент) ---
  const handleDeleteElement = async (elementId: number) => {
    if (confirm("Удалить элемент?")) {
      try {
        await dispatch(
          removeElement({ forecastId: forecast.id, elementId })
        ).unwrap();
        setToastMsg("Элемент удален.");
        setShowToast(true);
        dispatch(fetchForecastDetail(forecast.id));
      } catch (err: any) {
        setToastMsg("Ошибка удаления.");
        setShowToast(true);
      }
    }
  };

  // --- КНОПКА 4: Сформировать (Перевести в статус 2) ---
  const handleSubmit = async () => {
    // 1. Проверка: заполнено ли поле локально
    if (!localVolume) {
      setToastMsg("Введите объем!");
      setShowToast(true);
      return;
    }

    try {
      // 2. АВТОСОХРАНЕНИЕ: Если данные в инпуте отличаются от базы, сначала сохраняем их
      if (localVolume !== String(forecast.volume)) {
        await dispatch(
          saveForecastVolume({ id: forecast.id, volume: Number(localVolume) })
        ).unwrap();
      }

      // (Опционально) Можно также пробежаться по температурам и сохранить их,
      // но ошибка 405 именно из-за объема.

      // 3. Теперь, когда данные в БД обновлены, меняем статус
      await dispatch(submitForecast(forecast.id)).unwrap();

      dispatch(fetchCart());
      navigate("/forecasts");
    } catch (err: any) {
      // Если придет ошибка 405, мы увидим текст ошибки
      const errorText =
        err.response?.data?.error || err.message || "Ошибка формирования.";
      setToastMsg(errorText);
      setShowToast(true);
    }
  };
  // --- КНОПКА 5: Удалить заявку (Черновик) ---
  const handleDeleteDraft = async () => {
    if (confirm("Удалить черновик?")) {
      try {
        await dispatch(deleteForecast(forecast.id)).unwrap();
        dispatch(fetchCart());
        navigate("/elements");
      } catch (err: any) {
        setToastMsg("Ошибка удаления заявки.");
        setShowToast(true);
      }
    }
  };

  const handleAdminAction = async (status: number) => {
    await dispatch(adminStatusUpdate({ id: forecast.id, status })).unwrap();
    navigate("/forecasts");
  };

  return (
    <Container className="py-4">
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="light"
        >
          <Toast.Body>{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Прогноз №{forecast.id}</h1>
        <h3>
          Статус:{" "}
          {forecast.status === 1
            ? "Черновик"
            : forecast.status === 2
            ? "В работе"
            : forecast.status === 3
            ? "Завершен"
            : "Отклонен"}
        </h3>
      </div>

      <Card className="mb-4 p-3">
        <Form.Group as={Row} className="align-items-center">
          <Form.Label column sm={2}>
            Объем:
          </Form.Label>
          <Col sm={4}>
            <Form.Control
              type="number"
              value={localVolume}
              onChange={(e) => setLocalVolumeState(e.target.value)}
              disabled={!isDraft}
            />
          </Col>
          {isDraft && (
            <Col sm={3}>
              {/* КНОПКА 1 */}
              <Button variant="primary" onClick={handleSaveVolume}>
                Сохранить поля заявки
              </Button>
            </Col>
          )}
          {forecast.status === 3 && (
            <Col sm={3} className="text-success fw-bold">
              Завершен: {formatDateRU(forecast.date_complete)}
            </Col>
          )}
        </Form.Group>
      </Card>

      <h4>Элементы:</h4>
      <Table bordered hover>
        <thead>
          <tr>
            <th>Элемент</th>
            <th>Температура</th>
            {forecast.status === 3 && <th>Результат (Вес)</th>}
            {isDraft && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {elements.map((item) => (
            <tr key={item.id}>
              <td>
                {item.name} <br />
                <small className="text-muted">{item.formula}</small>
              </td>
              <td>
                <div className="d-flex">
                  <Form.Control
                    type="number"
                    value={localTemperatures[item.id] || ""}
                    onChange={(e) =>
                      setLocalTemperatures((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    disabled={!isDraft}
                    style={{ maxWidth: "100px" }}
                  />
                  {isDraft && (
                    /* КНОПКА 2 */
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleSaveTemperature(item.id)}
                    >
                      Сохранить
                    </Button>
                  )}
                </div>
              </td>
              {forecast.status === 3 && (
                <td className="fw-bold">{item.weight?.toFixed(4)}</td>
              )}
              {isDraft && (
                <td>
                  {/* КНОПКА 3 */}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteElement(item.id)}
                  >
                    Удалить
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="mt-4 d-flex gap-3">
        {isDraft && isOwner && (
          <>
            {/* КНОПКА 4 */}
            <Button variant="success" size="lg" onClick={handleSubmit}>
              Сформировать
            </Button>
            {/* КНОПКА 5 */}
            <Button variant="outline-danger" onClick={handleDeleteDraft}>
              Удалить заявку
            </Button>
          </>
        )}
        {isModerator && forecast.status === 2 && (
          <>
            <Button variant="success" onClick={() => handleAdminAction(3)}>
              Завершить
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
