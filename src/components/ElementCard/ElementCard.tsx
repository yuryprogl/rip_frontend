// src/components/ElementCard/ElementCard.tsx
import { Card, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import type { Element } from "../../modules/ElementsTypes";
import defaultImage from "../../assets/default-image.png";

interface ElementCardProps {
  element: Element;
}

export default function ElementCard({ element }: ElementCardProps) {
  const imageUrl = element.image || defaultImage;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultImage;
  };

  return (
    <Card className="h-100">
      <Card.Img variant="top" src={imageUrl} onError={handleImageError} />
      <Card.Body className="d-flex flex-column">
        <div className="flex-grow-1">
          <Card.Title as="h5">{element.name}</Card.Title>
          <Card.Text className="text-muted small">
            Формула: {element.formula}
          </Card.Text>
        </div>
        <div className="card-btns mt-3">
          <Row className="w-100">
            <Col>
              <Button
                as={Link}
                to={`/elements/${element.id}`}
                variant="primary"
                className="w-100"
              >
                Открыть
              </Button>
            </Col>
            <Col>
              {/* Кнопка "Добавить" пока не будет работать, т.к. это не входит в задание */}
              <Button variant="secondary" className="w-100" disabled>
                Добавить
              </Button>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
}
