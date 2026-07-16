import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "requests",
  initialState: null,
  reducers: {
    addRequests: (state, action) => action.payload,
    appendRequests: (state, action) => [...(state || []), ...action.payload],
    removeRequest: (state, action) => {
      const newArray = state.filter((r) => r._id !== action.payload);
      return newArray;
    },
  },
});

export const { addRequests, appendRequests, removeRequest } = requestSlice.actions;
export default requestSlice.reducer;