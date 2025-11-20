import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import tripReducer from "../features/trips/tripSlice";
import bookingReducer from "../features/bookings/bookingSlice";
import checkoutReducer from "../features/checkout/checkoutSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trips: tripReducer,
    bookings: bookingReducer,
    checkout: checkoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

