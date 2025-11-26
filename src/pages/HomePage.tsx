import { Container } from "react-bootstrap";

export default function HomePage() {
  return (
    <div
      style={{
        position: "relative",
        // Высота рассчитывается так, чтобы занять все место под хедером
        height: "calc(100vh - 56px)",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Фоновое видео */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100vw", // Растягиваем на ширину вьюпорта
          height: "100vh", // Растягиваем на высоту вьюпорта (с запасом)
          objectFit: "cover", // Сохраняем пропорции, обрезая лишнее
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      >
        <source src="/background.mp4" type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>

      {/* Затемнение */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)", // Чуть темнее для контраста
          zIndex: 1,
        }}
      ></div>

      {/* Контент */}
      <Container
        className="d-flex flex-column justify-content-center align-items-center text-center h-100"
        style={{ position: "relative", zIndex: 2, color: "#fff" }}
      >
        <h1 className="display-3 fw-bold">Прогноз растворимости осадка</h1>
        <p className="lead my-4">
          Веб-приложение для анализа и прогнозирования растворимости химических
          элементов.
        </p>
      </Container>
    </div>
  );
}
