import { configureStore } from "@reduxjs/toolkit";
import filterReducer from "./filterSlice"; // Оставь из ЛР6
import authReducer from "./authSlice";
import forecastReducer from "./forecastSlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    auth: authReducer,
    forecasts: forecastReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
