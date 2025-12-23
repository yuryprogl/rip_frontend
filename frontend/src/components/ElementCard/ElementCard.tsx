import { Card, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import type { Element } from "../../types"; // Используем новые типы из types/index.ts
import defaultImage from "../../assets/default-image.png";

interface ElementCardProps {
  element: Element;
  // Новый проп: функция добавления (опционально, т.к. может быть скрыта)
  onAdd?: (id: number) => void;
  // Флаг: показывать ли кнопку добавления
  showAddButton?: boolean;
}

export default function ElementCard({
  element,
  onAdd,
  showAddButton = false,
}: ElementCardProps) {
  // Проверка на null image (приходит с бека)
  const imageUrl = element.image || defaultImage;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultImage;
  };

  return (
    <Card
      className="h-100 shadow-sm"
      style={{ transition: "0.3s", border: "none" }}
    >
      <Card.Img
        variant="top"
        src={imageUrl}
        onError={handleImageError}
        style={{ height: "200px", objectFit: "cover" }}
      />
      <Card.Body className="d-flex flex-column">
        <div className="flex-grow-1">
          <Card.Title as="h5" className="fw-bold">
            {element.name}
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {element.formula}
          </Card.Subtitle>
          <Card.Text
            className="text-secondary small"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {element.description}
          </Card.Text>
        </div>

        <div className="mt-3">
          <Row className="g-2">
            <Col xs={showAddButton ? 6 : 12}>
              <Button
                as={Link as any}
                to={`/elements/${element.id}`}
                variant="outline-primary"
                className="w-100"
              >
                Подробнее
              </Button>
            </Col>

            {showAddButton && onAdd && (
              <Col xs={6}>
                <Button
                  variant="success"
                  className="w-100"
                  onClick={(e) => {
                    e.preventDefault(); // Чтобы не переходить по ссылке если карточка обернута
                    onAdd(element.id);
                  }}
                >
                  В прогноз
                </Button>
              </Col>
            )}
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
}
