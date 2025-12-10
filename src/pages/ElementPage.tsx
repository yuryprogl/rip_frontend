// src/pages/ElementPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Spinner,
  Container,
  Row,
  Col,
  Image,
  Alert,
  Button,
} from "react-bootstrap";
import BreadCrumbs from "../components/BreadCrumbs/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../Routes";
import { getElement } from "../modules/ElementsApi";
import type { Element } from "../modules/ElementsTypes";
import defaultImage from "../assets/default-image.png";

export default function ElementPage() {
  const [element, setElement] = useState<Element | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>(); // Получаем id из URL

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID элемента не указан в URL.");
      return;
    }

    setLoading(true);
    getElement(Number(id))
      .then((data) => {
        if (data) {
          setElement(data);
        } else {
          setError("Элемент с таким ID не найден.");
        }
      })
      .catch(() => {
        setError("Произошла ошибка при загрузке данных.");
      })
      .finally(() => setLoading(false));
  }, [id]); // Эффект будет перезапускаться, если id изменится

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultImage;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" style={{ width: "3rem", height: "3rem" }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link as any} to={ROUTES.ELEMENTS} variant="primary">
          Вернуться к списку
        </Button>
      </Container>
    );
  }

  // element не может быть null на этом этапе, но TypeScript этого не знает
  if (!element) return null;

  return (
    <Container as="main" className="py-4">
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.ELEMENTS, path: ROUTES.ELEMENTS },
          { label: element.name }, // Последняя крошка - не ссылка
        ]}
      />
      <Row className="mt-4 g-4">
        <Col md={5} lg={4}>
          <Image
            src={element.image || defaultImage}
            onError={handleImageError}
            fluid
            rounded
            className="shadow-sm"
          />
        </Col>
        <Col md={7} lg={8} className="d-flex flex-column">
          <h1>{element.name}</h1>
          <p className="text-muted fs-5">Формула: {element.formula}</p>
          <p className="mt-3 flex-grow-1">{element.description}</p>
          <div className="mt-4">
            <Button
              as={Link as any as any}
              to={ROUTES.ELEMENTS}
              variant="primary"
            >
              Назад к списку
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
