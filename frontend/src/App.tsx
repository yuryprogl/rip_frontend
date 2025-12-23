import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "./store/authSlice";
import type { AppDispatch } from "./store/store";

import Header from "./components/Header/Header";
import HomePage from "./pages/HomePage";
import ElementsPage from "./pages/ElementsPage";
import ElementPage from "./pages/ElementPage"; // Существующая
import LoginPage from "./pages/LoginPage";
import ForecastsPage from "./pages/ForecastsPage"; // Новая
import ForecastDetailPage from "./pages/ForecastDetailPage"; // Новая
import ProfilePage from "./pages/ProfilePage"; // Сделай по аналогии с Login
import VisualSearchPage from "./pages/VisualSearchPage";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/elements" element={<ElementsPage />} />
          <Route path="/elements/:id" element={<ElementPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/forecasts" element={<ForecastsPage />} />
          <Route path="/forecasts/:id" element={<ForecastDetailPage />} />

          <Route path="/visual-search" element={<VisualSearchPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
export default App;
