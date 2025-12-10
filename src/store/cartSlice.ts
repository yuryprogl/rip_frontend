import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Api } from "../api/Api";

interface CartState {
  count: number;
  draftId: number | null;
}

const initialState: CartState = { count: 0, draftId: null };

export const fetchCart = createAsyncThunk("cart/fetch", async () => {
  const response = await Api.getCartInfo();
  return response.data;
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.count = action.payload.elements_count;
      state.draftId = action.payload.draft_forecast;
    });
  },
});

export default cartSlice.reducer;
