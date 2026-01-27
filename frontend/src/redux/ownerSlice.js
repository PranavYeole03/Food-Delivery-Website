import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
  name: "owner",
  initialState: {
    myShopData: null,
  },
  reducers: {
    setmyShopData: (state, action) => {
      state.myShopData = action.payload;
    },
  },
});

export const { setmyShopData } = ownerSlice.actions;
export default ownerSlice.reducer;
