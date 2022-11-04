import { combineReducers } from "@reduxjs/toolkit";
import orderSlice from "./orderSlice";

const rootReducer = combineReducers({
  orders: orderSlice,
});

export default rootReducer;
