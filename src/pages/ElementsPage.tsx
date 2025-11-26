// src/pages/ElementsPage.tsx
import { useEffect, useState } from "react";
import { Container, Spinner, Alert, Col } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux"; // Redux
import type { RootState } from "../store/store"; // Redux
import { setSearchQuery } from "../store/filterSlice"; // Redux

import BreadCrumbs from "../components/BreadCrumbs/BreadCrumbs";
import { ROUTE_LABELS } from "../Routes";
import { listElements, getCartInfoMock } from "../modules/ElementsApi";
import type { Element } from "../modules/ElementsTypes";
import Search from "../components/Search/Search";
import ElementsList from "../components/ElementsList/ElementsList";
import CartWidget from "../components/CartWidget/CartWidget";

export default function ElementsPage() {
  const [elements, setElements] = useState<Element[]>([]);
  const [cartCount, setCartCount] = useState(0);

  // REDUX: Достаем значение из стора
  const searchQuery = useSelector(
    (state: RootState) => state.filter.searchQuery
  );
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [elementsData, cartData] = await Promise.all([
        listElements(searchQuery),
        getCartInfoMock(),
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

  useEffect(() => {
    loadPageData();
  }, []); // Загружаем один раз при маунте, используя сохраненный query

  const handleSearch = () => {
    loadPageData();
  };

  // Обертка для dispatch
  const handleQueryChange = (val: string) => {
    dispatch(setSearchQuery(val));
  };

  return (
    <Container className="py-5 mt-3">
      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.ELEMENTS }]} />

      <div className="page-controls mt-3">
        <Col md={8}>
          <Search
            query={searchQuery}
            onQueryChange={handleQueryChange} // Передаем новую функцию
            onSearch={handleSearch}
          />
        </Col>
        <Col md={4} className="d-flex justify-content-end">
          <CartWidget count={cartCount} />
        </Col>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error && elements.length === 0 ? (
        <Alert variant="warning" className="text-center">
          {error}
        </Alert>
      ) : (
        <ElementsList elements={elements} />
      )}
    </Container>
  );
}
