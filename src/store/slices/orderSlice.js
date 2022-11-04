import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    books: [],
    errors: "",
  },
  reducers: {
    updateOrders(state, action) {
      const [price, count, amount] = action.payload;
      return {
        ...state,
        books: [{ price, count, amount }, ...state.books].slice(0, 10),
      };
    },
    updateOrdersFailed(state, action) {
      return {
        ...state,
        errors: action.payload,
      };
    },
    clearErrors(state) {
      return { ...state, errors: "" };
    },
  },
});

export const { updateOrders, updateOrdersFailed, clearErrors } = orderSlice.actions;

export default orderSlice.reducer;
