import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Api } from "../api/Api";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false, // <--- ДОЛЖНО БЫТЬ FALSE
  isLoading: true, // <--- TRUE, чтобы приложение сначала проверило сессию
  error: null,
};

// Проверка сессии при загрузке страницы
export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Api.getMe();
      // Если сервер вернул пустой объект или null, считаем что не авторизован
      if (!response.data || !response.data.id) {
        throw new Error("Not logged in");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue("Not authorized");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await Api.login(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Ошибка входа");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await Api.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- CHECK AUTH ---
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true; // Успех - мы авторизованы
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false; // Ошибка - мы ГОСТЬ
        state.user = null;
        state.isLoading = false;
      })

      // --- LOGIN ---
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.error = action.payload as string;
        state.isLoading = false;
      })

      // --- LOGOUT ---
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
