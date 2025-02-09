import { configureStore } from "@reduxjs/toolkit";
import employeeReducer from "./employeeSlice";
import paginationReducer from "./paginationSlice";
import languageReducer from "./languageSlice";

const store = configureStore({
  reducer: {
    employees: employeeReducer,
    pagination: paginationReducer,
    language: languageReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
