import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import {
  createTrip,
  deleteTrip,
  fetchTrips,
  updateTrip,
} from "../features/trips/tripSlice";
import { cancelBooking, fetchBookings } from "../features/bookings/bookingSlice";
import { formatSeatLabel } from "../components/SeatSelector";
import type { Booking, Trip } from "../types";

interface TripFormValues {
  from: string;
  to: string;
  dateTime: string;
  price: number;
  totalSeats: number;
}

const AdminPage = () => {
  const dispatch = useAppDispatch();
  const { items: trips, status: tripStatus } = useAppSelector(
    (state) => state.trips
  );
  const { items: bookings, status: bookingStatus } = useAppSelector(
    (state) => state.bookings
  );
  const { user } = useAppSelector((state) => state.auth);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<TripFormValues>({
    defaultValues: {
      from: "",
      to: "",
      dateTime: "",
      price: 0,
      totalSeats: 10,
    },
  });

  useEffect(() => {
    dispatch(fetchTrips());
    // Fetch all bookings for admin, or user's own bookings
    if (user?.role === "admin" && showAllBookings) {
      dispatch(fetchBookings({ all: "true" }));
    } else {
      dispatch(fetchBookings());
    }
  }, [dispatch, user?.role, showAllBookings]);

  const onSubmit = async (values: TripFormValues) => {
    const payload = {
      ...values,
      price: Number(values.price),
      totalSeats: Number(values.totalSeats),
    };

    if (editingTrip) {
      await dispatch(updateTrip({ id: editingTrip._id, payload })).unwrap();
    } else {
      await dispatch(createTrip(payload)).unwrap();
    }
    reset();
    setEditingTrip(null);
    setIsFormVisible(false);
  };

  const startEditing = (trip: Trip) => {
    setEditingTrip(trip);
    setIsFormVisible(true);
    setValue("from", trip.from);
    setValue("to", trip.to);
    setValue("dateTime", new Date(trip.dateTime).toISOString().slice(0, 16));
    setValue("price", trip.price);
    setValue("totalSeats", trip.totalSeats);
  };

  const toggleForm = () => {
    if (isFormVisible && !editingTrip) {
      reset();
    }
    setIsFormVisible((prev) => !prev);
    if (!isFormVisible) {
      setEditingTrip(null);
    }
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setEditingTrip(null);
    reset();
  };

  const totalTrips = trips.length;
  const totalBookings = bookings.length;
  const upcomingTrips = useMemo(
    () => trips.filter((trip) => new Date(trip.dateTime) > new Date()).length,
    [trips]
  );

  const renderTripRow = (trip: Trip, index: number) => {
    const departure = format(new Date(trip.dateTime), "hh:mm a");
    const arrival = format(
      new Date(new Date(trip.dateTime).getTime() + 2 * 60 * 60 * 1000),
      "hh:mm a"
    );
    return (
      <tr key={trip._id}>
        <td>{`T${String(index + 1).padStart(3, "0")}`}</td>
        <td>
          <strong>
            {trip.from} → {trip.to}
          </strong>
        </td>
        <td>{departure}</td>
        <td>{arrival}</td>
        <td>₹{trip.price.toFixed(2)}</td>
        <td>{trip.totalSeats}</td>
        <td className="admin-table__actions">
          <button
            type="button"
            className="icon-button"
            onClick={() => startEditing(trip)}
            aria-label="Edit trip"
          >
            ✏️
          </button>
          <button
            type="button"
            className="icon-button icon-button--danger"
            onClick={() => dispatch(deleteTrip(trip._id))}
            aria-label="Delete trip"
          >
            🗑️
          </button>
        </td>
      </tr>
    );
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await dispatch(cancelBooking(bookingId)).unwrap();
      } catch (error) {
        alert("Failed to cancel booking. Please try again.");
      }
    }
  };

  const renderBookingRow = (booking: Booking) => {
    const date = format(new Date(booking.trip.dateTime), "yyyy-MM-dd");
    const formattedSeats = booking.seats.map(formatSeatLabel).join(", ");
    const statusClass =
      booking.status === "confirmed"
        ? "status-pill status-pill--success"
        : "status-pill status-pill--pending";
    const verified = booking.status === "confirmed";

    // Format booking ID (using last 9 characters)
    const bookingIdString = String(booking.id);
    const bookingIdNumeric = bookingIdString.slice(-9);
    const bookingIdDisplay = `B1${bookingIdNumeric}`;

    // Get user name or fallback
    const userName = booking.user?.name || "Unknown User";

    return (
      <tr key={booking.id}>
        <td>
          <strong>{bookingIdDisplay}</strong>
        </td>
        <td>{userName}</td>
        <td>
          {booking.trip.from} → {booking.trip.to}
        </td>
        <td>{date}</td>
        <td>{formattedSeats}</td>
        <td>
          <span className={statusClass}>
            {booking.status === "confirmed" ? "Confirmed" : "Cancelled"}
          </span>
        </td>
        <td>
          <span
            className={`status-dot ${
              verified ? "status-dot--success" : "status-dot--muted"
            }`}
          />
        </td>
        <td className="admin-table__actions">
          <button
            type="button"
            className="icon-button"
            onClick={() => setSelectedBooking(booking)}
            aria-label="View booking details"
          >
            ✏️
          </button>
          <button
            type="button"
            className="icon-button icon-button--danger"
            onClick={() => handleCancelBooking(booking.id)}
            disabled={booking.status === "cancelled"}
            aria-label="Cancel booking"
          >
            🗑️
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Admin Overview</p>
          <h1>Admin Dashboard</h1>
          <p>
            Monitor trip inventory, bookings, and upcoming departures in one
            place.
          </p>
        </div>
        <div className="admin-header__actions">
          <button type="button" className="ghost-button">
            All Trips
          </button>
          <button type="button" className="primary-button" onClick={toggleForm}>
            {isFormVisible ? "Close Form" : "+ Add New Trip"}
          </button>
        </div>
      </header>

      <section className="admin-stats">
        <StatCard
          title="Total Trips"
          value={totalTrips}
          icon={<LightIcon />}
          loading={tripStatus === "loading"}
        />
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          icon={<TicketIcon />}
          loading={bookingStatus === "loading"}
        />
        <StatCard
          title="Upcoming Departures"
          value={upcomingTrips}
          icon={<ClockBadgeIcon />}
          loading={tripStatus === "loading"}
        />
      </section>

      {isFormVisible && (
        <div
          className="modal-overlay"
          onClick={closeForm}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ margin: 0 }}>Trip Details</h2>
              <button
                type="button"
                onClick={closeForm}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span style={{ fontWeight: "500" }}>From</span>
                  <input
                    type="text"
                    placeholder="Departure Location"
                    {...register("from", { required: true })}
                    style={{
                      padding: "0.75rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span style={{ fontWeight: "500" }}>To</span>
                  <input
                    type="text"
                    placeholder="Arrival Destination"
                    {...register("to", { required: true })}
                    style={{
                      padding: "0.75rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span style={{ fontWeight: "500" }}>Date & Time</span>
                  <input
                    type="datetime-local"
                    placeholder="Date & Time"
                    {...register("dateTime", { required: true })}
                    style={{
                      padding: "0.75rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span style={{ fontWeight: "500" }}>Price</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    {...register("price", { required: true, min: 1 })}
                    style={{
                      padding: "0.75rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span style={{ fontWeight: "500" }}>Total Seat</span>
                  <input
                    type="number"
                    placeholder="Total no. of seats"
                    {...register("totalSeats", { required: true, min: 1 })}
                    style={{
                      padding: "0.75rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                      fontSize: "1rem",
                    }}
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.6 : 1,
                    marginTop: "0.5rem",
                  }}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : editingTrip
                      ? "Update Trip"
                      : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2>Trip Management</h2>
            <p>Review, edit or remove active trips.</p>
          </div>
          <div className="admin-card__cta">
            <button type="button" className="ghost-button">
              All Trips
            </button>
          </div>
        </div>
        <div className="admin-table__wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Price</th>
                <th>Total Seats</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 && (
                <tr>
                  <td colSpan={7}>No trips created yet.</td>
                </tr>
              )}
              {trips.map((trip, index) => renderTripRow(trip, index))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2>Booking Management</h2>
            <p>Track passenger bookings and verification status.</p>
          </div>
          <div className="admin-card__cta">
            <button
              type="button"
              className={`ghost-button ${
                showAllBookings ? "ghost-button--active" : ""
              }`}
              onClick={() => setShowAllBookings(true)}
            >
              All Bookings
            </button>
            <button type="button" className="ghost-button">
              Verify QR
            </button>
          </div>
        </div>
        <div className="admin-table__wrapper">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Trip Route</th>
                <th>Date</th>
                <th>Seats</th>
                <th>Status</th>
                <th>QR Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8}>No bookings yet.</td>
                </tr>
              )}
              {bookings.map((booking) => renderBookingRow(booking))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedBooking && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedBooking(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2>Booking Details</h2>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <strong>Booking ID:</strong> {String(selectedBooking.id).slice(-9).padStart(9, "0")}
              </div>
              <div>
                <strong>User:</strong> {selectedBooking.user?.name || "Unknown"} ({selectedBooking.user?.email || "N/A"})
              </div>
              <div>
                <strong>Route:</strong> {selectedBooking.trip.from} → {selectedBooking.trip.to}
              </div>
              <div>
                <strong>Date:</strong> {format(new Date(selectedBooking.trip.dateTime), "yyyy-MM-dd hh:mm a")}
              </div>
              <div>
                <strong>Seats:</strong> {selectedBooking.seats.map(formatSeatLabel).join(", ")}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    selectedBooking.status === "confirmed"
                      ? "status-pill status-pill--success"
                      : "status-pill status-pill--pending"
                  }
                >
                  {selectedBooking.status === "confirmed" ? "Confirmed" : "Cancelled"}
                </span>
              </div>
              <div>
                <strong>Payment Amount:</strong> ₹{selectedBooking.payment.amount.toFixed(2)}
              </div>
              <div>
                <strong>Payment Method:</strong> {selectedBooking.payment.method}
              </div>
              <div>
                <strong>Payment Status:</strong> {selectedBooking.payment.status}
              </div>
              <div>
                <strong>Created At:</strong> {format(new Date(selectedBooking.createdAt), "yyyy-MM-dd hh:mm a")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  loading?: boolean;
}) => (
  <div className="stat-card">
    <div className="stat-card__icon">{icon}</div>
    <div>
      <p>{title}</p>
      <h3>{loading ? "..." : value}</h3>
    </div>
  </div>
);

const LightIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke="#2563eb"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="5" stroke="#2563eb" strokeWidth="1.5" />
  </svg>
);

const TicketIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="7"
      width="18"
      height="10"
      rx="2"
      stroke="#16a34a"
      strokeWidth="1.5"
    />
    <path
      d="M8 7v10M16 7v10"
      stroke="#16a34a"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ClockBadgeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="7" stroke="#f59e0b" strokeWidth="1.5" />
    <path
      d="M12 9v4l2 1"
      stroke="#f59e0b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default AdminPage;
