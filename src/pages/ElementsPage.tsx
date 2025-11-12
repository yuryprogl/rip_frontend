// src/pages/ElementsPage.tsx
import { useEffect, useState } from "react";
import { Container, Spinner, Alert, Row, Col } from "react-bootstrap";
import BreadCrumbs from "../components/BreadCrumbs/BreadCrumbs";
import { ROUTE_LABELS } from "../Routes";
import { listElements, getCartInfo } from "../modules/ElementsApi"; // Импортируем getCartInfo
import type { Element } from "../modules/ElementsTypes";
import Search from "../components/Search/Search";
import ElementsList from "../components/ElementsList/ElementsList";
import CartWidget from "../components/CartWidget/CartWidget"; // Импортируем новый компонент

export default function ElementsPage() {
  const [elements, setElements] = useState<Element[]>([]);
  const [cartCount, setCartCount] = useState(0); // Новое состояние для счетчика корзины
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Объединяем загрузку данных в одну функцию
  const loadPageData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Запускаем оба запроса параллельно для ускорения загрузки
      const [elementsData, cartData] = await Promise.all([
        listElements(searchQuery), // Передаем searchQuery для фильтрации
        getCartInfo(),
      ]);

      setElements(elementsData);
      setCartCount(cartData.elements_count);

      if (elementsData.length === 0 && searchQuery) {
        setError(`Элементы по запросу "${searchQuery}" не найдены.`);
      }
    } catch (err) {
      setError("Не удалось загрузить данные.");
    } finally {
      setLoading(false);
    }
  };

  // Загружаем данные только один раз при первом рендере
  useEffect(() => {
    loadPageData();
  }, []); // Пустой массив зависимостей

  // Обработчик для кнопки поиска
  const handleSearch = () => {
    // При поиске нам не нужно перезапрашивать корзину, только список элементов
    // Но для простоты в этой лабе будем перезапрашивать все
    loadPageData();
  };

  return (
    <Container as="main">
      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.ELEMENTS }]} />

      <div className="page-controls mt-3">
        <Col md={8}>
          <Search
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </Col>
        <Col md={4} className="d-flex justify-content-end">
          {/* Заменяем старую кнопку на новый компонент */}
          <CartWidget count={cartCount} />
        </Col>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error && elements.length === 0 ? ( // Условие для показа ошибки
        <Alert variant="warning" className="text-center">
          {error}
        </Alert>
      ) : (
        <ElementsList elements={elements} />
      )}
    </Container>
  );
}
