import { Row, Col } from "react-bootstrap";
import ElementCard from "../ElementCard/ElementCard";
import { type Element } from "../../types";

interface ElementsListProps {
  elements: Element[];
  onAdd?: (id: number) => void;
  showAddButton?: boolean;
}

export default function ElementsList({
  elements,
  onAdd,
  showAddButton,
}: ElementsListProps) {
  return (
    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
      {elements.map((el) => (
        <Col key={el.id}>
          <ElementCard
            element={el}
            onAdd={onAdd}
            showAddButton={showAddButton}
          />
        </Col>
      ))}
    </Row>
  );
}
