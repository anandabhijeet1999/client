import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { Booking } from "../../types";

interface BookingState {
  items: Booking[];
  status: "idle" | "loading" | "error";
  error?: string;
  lastCreated?: Booking;
}

const initialState: BookingState = {
  items: [],
  status: "idle",
};

export const fetchBookings = createAsyncThunk<
  Booking[],
  { type?: "upcoming" | "past"; all?: string } | undefined
>(
  "bookings/fetch",
  async (params) => {
    const { data } = await api.get<Booking[]>("/bookings", { params });
    return data;
  },
);

export const createBooking = createAsyncThunk<Booking, { tripId: string; seats: string[]; paymentMethod: string }>(
  "bookings/create",
  async (payload) => {
    const { data } = await api.post<Booking>("/bookings", payload);
    return data;
  },
);

export const cancelBooking = createAsyncThunk<Booking, string>("bookings/cancel", async (id) => {
  const { data } = await api.patch<Booking>(`/bookings/${id}/cancel`);
  return data;
});

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.lastCreated = action.payload;
        state.items.unshift(action.payload);
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.items = state.items.map((booking) => (booking.id === action.payload.id ? action.payload : booking));
      });
  },
});

export default bookingSlice.reducer;

