import { Row, Col } from "react-bootstrap";
import ElementCard from "../ElementCard/ElementCard";
import { type Element } from "../../modules/ElementsTypes";

interface ElementsListProps {
  elements: Element[];
}

export default function ElementsList({ elements }: ElementsListProps) {
  return (
    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
      {elements.map((el) => (
        <Col key={el.id}>
          <ElementCard element={el} />
        </Col>
      ))}
    </Row>
  );
}
