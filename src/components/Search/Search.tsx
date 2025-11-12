import { Form, Row, Col, Button } from "react-bootstrap";

interface SearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}

export default function Search({
  query,
  onQueryChange,
  onSearch,
}: SearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <Form onSubmit={handleSubmit} className="w-100">
      <Row>
        <Col xs={8}>
          <Form.Control
            type="text"
            placeholder="Введите название"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </Col>
        <Col xs={4}>
          <Button variant="primary" type="submit" className="w-100">
            Поиск
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
