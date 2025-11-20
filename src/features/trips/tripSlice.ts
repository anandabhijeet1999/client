import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { Trip } from "../../types";

interface TripFilters {
  from?: string;
  to?: string;
  date?: string;
}

interface TripState {
  items: Trip[];
  selectedTrip?: Trip;
  status: "idle" | "loading" | "error";
  error?: string;
  filters: TripFilters;
}

const initialState: TripState = {
  items: [],
  status: "idle",
  filters: {},
};

export const fetchTrips = createAsyncThunk<Trip[], TripFilters | undefined>("trips/fetch", async (filters) => {
  const { data } = await api.get<Trip[]>("/trips", { params: filters });
  return data;
});

export const fetchTripById = createAsyncThunk<Trip, string>("trips/fetchById", async (id) => {
  const { data } = await api.get<Trip>(`/trips/${id}`);
  return data;
});

export const createTrip = createAsyncThunk<Trip, Omit<Trip, "_id" | "availableSeats" | "seatMap"> & { dateTime: string }>(
  "trips/create",
  async (payload) => {
    const { data } = await api.post<Trip>("/trips", payload);
    return data;
  },
);

export const updateTrip = createAsyncThunk<Trip, { id: string; payload: Partial<Trip> }>("trips/update", async ({ id, payload }) => {
  const { data } = await api.patch<Trip>(`/trips/${id}`, payload);
  return data;
});

export const deleteTrip = createAsyncThunk<string, string>("trips/delete", async (id) => {
  await api.delete(`/trips/${id}`);
  return id;
});

const tripSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<TripFilters>) {
      state.filters = action.payload;
    },
    clearSelectedTrip(state) {
      state.selectedTrip = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message;
      })
      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.selectedTrip = action.payload;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        state.items = state.items.map((trip) => (trip._id === action.payload._id ? action.payload : trip));
        state.selectedTrip = action.payload;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.items = state.items.filter((trip) => trip._id !== action.payload);
      });
  },
});

export const { setFilters, clearSelectedTrip } = tripSlice.actions;
export default tripSlice.reducer;

