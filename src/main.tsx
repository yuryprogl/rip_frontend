import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Импорт регистрации PWA
import { registerSW } from "virtual:pwa-register";

// Регистрация SW
if ("serviceWorker" in navigator) {
  registerSW();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
