// src/App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./Routes";
import Header from "./components/Header/Header";
import HomePage from "./pages/HomePage";
import ElementsPage from "./pages/ElementsPage";
import ElementPage from "./pages/ElementPage";

// Укажи здесь имя своего репозитория, например "/lab5"
const REPO_NAME = "/rip_frontend";

function App() {
  return (
    // Добавляем basename только для продакшена (когда деплоим)
    // Но для теста можно оставить жестко
    <BrowserRouter basename={import.meta.env.DEV ? "/" : REPO_NAME}>
      <Header />
      <main>
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.ELEMENTS} element={<ElementsPage />} />
          <Route path={ROUTES.ELEMENT} element={<ElementPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
export default App;
