// src/main.tsx
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux"; // <--- Import
import { store } from "./store/store"; // <--- Import
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
