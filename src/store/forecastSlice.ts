import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Api } from "../api/Api";
import type { Forecast, ForecastDetail, ForecastFilters } from "../types";

interface ForecastState {
  list: Forecast[];
  current: ForecastDetail | null;
  isLoading: boolean;
  error: string | null;
  // Локальные данные для редактирования (чтобы не отправлять запрос на каждую букву)
  localData: {
    volume: string; // Строка для удобства ввода
    temperatures: Record<number, string>; // element_id -> value
  };
}

const initialState: ForecastState = {
  list: [],
  current: null,
  isLoading: false,
  error: null,
  localData: { volume: "", temperatures: {} },
};

export const fetchForecasts = createAsyncThunk(
  "forecasts/list",
  async (filters: ForecastFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await Api.getForecasts(filters);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchForecastDetail = createAsyncThunk(
  "forecasts/detail",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await Api.getForecastById(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveForecastVolume = createAsyncThunk(
  "forecasts/saveVolume",
  async (
    { id, volume }: { id: number; volume: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await Api.updateForecast(id, { volume });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error saving volume"
      );
    }
  }
);

export const saveElementTemperature = createAsyncThunk(
  "forecasts/saveTemperature",
  async (
    {
      forecastId,
      elementId,
      temperature,
    }: { forecastId: number; elementId: number; temperature: number },
    { rejectWithValue }
  ) => {
    try {
      await Api.updateElementInForecast(forecastId, elementId, { temperature });
      return { elementId, temperature };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Error saving temperature"
      );
    }
  }
);

export const removeElement = createAsyncThunk(
  "forecasts/removeElement",
  async ({
    forecastId,
    elementId,
  }: {
    forecastId: number;
    elementId: number;
  }) => {
    const response = await Api.deleteElementFromForecast(forecastId, elementId);
    return response.data; // Возвращает обновленный список элементов
  }
);

export const submitForecast = createAsyncThunk(
  "forecasts/submit",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await Api.submitForecast(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Ошибка формирования"
      );
    }
  }
);

export const adminStatusUpdate = createAsyncThunk(
  "forecasts/adminUpdate",
  async ({ id, status }: { id: number; status: number }) => {
    const response = await Api.updateStatusAdmin(id, status);
    return response.data;
  }
);

export const deleteForecast = createAsyncThunk(
  "forecasts/delete",
  async (id: number) => {
    await Api.deleteForecast(id);
    return id;
  }
);

const forecastSlice = createSlice({
  name: "forecasts",
  initialState,
  reducers: {
    setLocalVolume: (state, action: PayloadAction<string>) => {
      state.localData.volume = action.payload;
    },
    setLocalTemperature: (
      state,
      action: PayloadAction<{ id: number; val: string }>
    ) => {
      state.localData.temperatures[action.payload.id] = action.payload.val;
    },
    resetCurrent: (state) => {
      state.current = null;
      state.localData = { volume: "", temperatures: {} };
    },
  },
  extraReducers: (builder) => {
    builder
      // LIST
      .addCase(fetchForecasts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchForecasts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      // DETAIL
      .addCase(fetchForecastDetail.fulfilled, (state, action) => {
        // Ответ бекенда - это объект прогноза, внутри которого лежит массив elements
        const data = action.payload;

        // 1. Формируем структуру state.current вручную
        state.current = {
          forecast: {
            // Берем все поля прогноза, исключая массив elements (чтобы не дублировать)
            id: data.id,
            status: data.status,
            date_created: data.date_created,
            date_formation: data.date_formation,
            date_complete: data.date_complete,
            owner: data.owner,
            moderator: data.moderator,
            volume: data.volume,
          },
          elements: data.elements, // Массив элементов отдельно
        };

        // 2. Инициализируем локальные данные для редактирования
        // ВАЖНО: берем volume напрямую из data (так как data - это сам прогноз)
        state.localData.volume =
          data.volume !== null ? data.volume.toString() : "";

        const temps: Record<number, string> = {};

        // ВАЖНО: используем item.id, так как мы поправили типы
        if (Array.isArray(data.elements)) {
          data.elements.forEach((el: any) => {
            temps[el.id] =
              el.temperature !== null ? el.temperature.toString() : "";
          });
        }

        state.localData.temperatures = temps;
        state.isLoading = false;
      })

      // UPDATE Volume
      .addCase(saveForecastVolume.fulfilled, (state, action) => {
        if (state.current) state.current.forecast = action.payload;
      })
      // DELETE Element
      .addCase(removeElement.fulfilled, (state, action) => {
        if (state.current) {
          // Бекенд возвращает список ElementItemSerializer
          // Но нам нужно маппить его обратно в формат ForecastDetail['elements']
          // В данном случае проще удалить локально или перезапросить детальку
          // Для простоты перезапишем (в реальной лр6 бекенд возвращает список)
          state.current.elements = action.payload as any;
        }
      })
      // SUBMIT
      .addCase(submitForecast.fulfilled, (state, action) => {
        if (state.current) state.current.forecast = action.payload;
      })
      // ADMIN
      .addCase(adminStatusUpdate.fulfilled, (state, action) => {
        if (state.current) state.current.forecast = action.payload;
      });
  },
});

export const { setLocalVolume, setLocalTemperature, resetCurrent } =
  forecastSlice.actions;
export default forecastSlice.reducer;
