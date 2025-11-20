import { useEffect } from "react";
import BookingCard from "../components/BookingCard";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { cancelBooking, fetchBookings } from "../features/bookings/bookingSlice";

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const MyBookingsPage = () => {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.bookings);
  const { accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const upcoming = items.filter((booking) => new Date(booking.trip.dateTime) >= new Date());
  const past = items.filter((booking) => new Date(booking.trip.dateTime) < new Date());

  const downloadTicket = async (id: string) => {
    if (!accessToken) return;
    const response = await fetch(`${apiBase}/bookings/${id}/ticket`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `booking-${id}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <h2>My Bookings</h2>
      {status === "loading" && <p>Loading bookings...</p>}
      <section>
        <h3>Upcoming</h3>
        <div className="grid">
          {upcoming.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onCancel={(id) => dispatch(cancelBooking(id))} onDownloadTicket={downloadTicket} />
          ))}
          {upcoming.length === 0 && <p>No upcoming bookings.</p>}
        </div>
      </section>
      <section>
        <h3>Past</h3>
        <div className="grid">
          {past.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onCancel={(id) => dispatch(cancelBooking(id))} onDownloadTicket={downloadTicket} />
          ))}
          {past.length === 0 && <p>No past bookings.</p>}
        </div>
      </section>
    </div>
  );
};

export default MyBookingsPage;

