import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PaginationState {
  currentPage: number;
  searchQuery: string;
}

const initialState: PaginationState = {
  currentPage: 1,
  searchQuery: ""
};

const paginationSlice = createSlice({
  name: "pagination",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    }
  }
});

export const { setPage, setSearchQuery } = paginationSlice.actions;
export default paginationSlice.reducer;
