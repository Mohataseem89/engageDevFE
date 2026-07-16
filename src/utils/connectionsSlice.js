import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connection",
  initialState: null,
  reducers: {
    addConnections: (state, action) => action.payload,
    appendConnections: (state, action) => [...(state || []), ...action.payload],
    removeConnections: () => null,
  },
});

export const { addConnections, appendConnections, removeConnections } = connectionSlice.actions;

export default connectionSlice.reducer;