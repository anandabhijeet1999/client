export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  profileImage?: string | null;
  createdAt: string;
}

export interface Trip {
  _id: string;
  from: string;
  to: string;
  dateTime: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  seatMap: {
    totalSeats: number;
    bookedSeats: string[];
  };
  duration?: string | null;
  rating?: number | null;
  reviews?: number | null;
  oldPrice?: number | null;
  tag?: string | null;
  discount?: string | null;
  image?: string | null;
}

export interface Booking {
  id: string;
  trip: Trip;
  seats: string[];
  status: "confirmed" | "cancelled";
  payment: {
    amount: number;
    method: string;
    status: "paid" | "pending" | "failed";
  };
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

