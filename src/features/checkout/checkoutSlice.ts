import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Trip } from "../../types";

interface CheckoutState {
  trip?: Trip;
  seats: string[];
  paymentMethod: string;
}

const initialState: CheckoutState = {
  seats: [],
  paymentMethod: "card",
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setCheckoutTrip(state, action: PayloadAction<{ trip: Trip; seats: string[] }>) {
      state.trip = action.payload.trip;
      state.seats = action.payload.seats;
    },
    updatePaymentMethod(state, action: PayloadAction<string>) {
      state.paymentMethod = action.payload;
    },
    resetCheckout() {
      return initialState;
    },
  },
});

export const { setCheckoutTrip, updatePaymentMethod, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;

