// src/App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./Routes";
import Header from "./components/Header/Header";
import HomePage from "./pages/HomePage";
import ElementsPage from "./pages/ElementsPage";
import ElementPage from "./pages/ElementPage"; // <--- Раскомментируем для следующего шага

function App() {
  return (
    <BrowserRouter>
      {/* 
        Header теперь находится вне <main>. 
        Он будет отображаться на всех страницах.
      */}
      <Header />

      {/* Основной контент страницы */}
      <main>
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.ELEMENTS} element={<ElementsPage />} />
          {/* Пока оставим заглушку для страницы элемента */}
          <Route path={ROUTES.ELEMENT} element={<ElementPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
