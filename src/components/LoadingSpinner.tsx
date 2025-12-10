import { Spinner, Container } from "react-bootstrap";

export default function LoadingSpinner() {
  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "200px" }}
    >
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Загрузка...</span>
      </Spinner>
    </Container>
  );
}
