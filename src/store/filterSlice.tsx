import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"; // <--- Исправление здесь

interface FilterState {
  searchQuery: string;
}

const initialState: FilterState = {
  searchQuery: "",
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    // Теперь TypeScript понимает, что это типизация аргумента
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setSearchQuery } = filterSlice.actions;
export default filterSlice.reducer;
