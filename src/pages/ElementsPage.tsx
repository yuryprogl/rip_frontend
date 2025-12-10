import { useEffect, useState } from "react";
import { Container, Alert, Col, Toast, ToastContainer } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { setSearchQuery } from "../store/filterSlice";
import { fetchCart } from "../store/cartSlice"; // Для обновления счетчика в шапке

import BreadCrumbs from "../components/BreadCrumbs/BreadCrumbs";
import { ROUTE_LABELS } from "../Routes"; // Если используешь Routes.ts, или просто хардкод
import { Api } from "../api/Api"; // Наше API
import type { Element } from "../types";

import Search from "../components/Search/Search";
import ElementsList from "../components/ElementsList/ElementsList";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ElementsPage() {
  const [elements, setElements] = useState<Element[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние для Toast уведомления
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const searchQuery = useSelector(
    (state: RootState) => state.filter.searchQuery
  );
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Загрузка данных
  const loadElements = async () => {
    setLoading(true);
    setError(null);
    try {
      // Используем метод из Api.ts, который вызывает бекенд
      const response = await Api.getElements(searchQuery);
      setElements(response.data);

      if (response.data.length === 0 && searchQuery) {
        setError(`Элементы по запросу "${searchQuery}" не найдены.`);
      }
    } catch (err: any) {
      console.error(err);
      setError("Не удалось загрузить список элементов.");
    } finally {
      setLoading(false);
    }
  };

  // Эффект при монтировании и изменении поиска (если хотим автопоиск, но у нас кнопка)
  // В ЛР1 была кнопка, здесь можно оставить так же.
  useEffect(() => {
    loadElements();
  }, []);

  const handleSearch = () => {
    loadElements();
  };

  const handleQueryChange = (val: string) => {
    dispatch(setSearchQuery(val));
  };

  // --- ЛОГИКА ДОБАВЛЕНИЯ В ПРОГНОЗ ---
  const handleAddToForecast = async (elementId: number) => {
    if (!isAuthenticated) {
      setToastMsg("Пожалуйста, авторизуйтесь для создания прогноза.");
      setShowToast(true);
      return;
    }

    try {
      await Api.addToForecast(elementId);
      // После успешного добавления обновляем состояние корзины в Redux
      dispatch(fetchCart());

      setToastMsg("Элемент успешно добавлен в прогноз!");
      setShowToast(true);
    } catch (err: any) {
      // Если 405 Method Not Allowed - значит элемент уже есть в заявке (по логике бека)
      if (err.response?.status === 405) {
        setToastMsg("Этот элемент уже добавлен в текущий черновик.");
      } else {
        setToastMsg(
          "Ошибка добавления: " +
            (err.response?.data?.detail || "Неизвестная ошибка")
        );
      }
      setShowToast(true);
    }
  };

  // Условие отображения кнопки:
  // Пользователь авторизован И он НЕ суперюзер (модераторы обычно только проверяют)
  // В твоей логике: Moderator views/approves, User creates.
  const showAddButton = isAuthenticated && !user?.is_superuser;

  return (
    <Container className="py-5 mt-3 position-relative">
      {/* Toast Notification */}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1050 }}
      >
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="light"
        >
          <Toast.Header>
            <strong className="me-auto">Система</strong>
          </Toast.Header>
          <Toast.Body>{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Breadcrumbs можно убрать или оставить, если есть компонент */}
      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.ELEMENTS }]} />

      <div className="page-controls mt-3 mb-4">
        <Col md={8}>
          <Search
            query={searchQuery}
            onQueryChange={handleQueryChange}
            onSearch={handleSearch}
          />
        </Col>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error && elements.length === 0 ? (
        <Alert variant="warning" className="text-center">
          {error}
        </Alert>
      ) : (
        <ElementsList
          elements={elements}
          onAdd={handleAddToForecast}
          showAddButton={showAddButton}
        />
      )}
    </Container>
  );
}
