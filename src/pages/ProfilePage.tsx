import { useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchBookings, cancelBooking } from "../features/bookings/bookingSlice";
import { formatSeatLabel } from "../components/SeatSelector";
import type { Booking } from "../types";

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: bookings, status } = useAppSelector((state) => state.bookings);
  const { accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const upcoming = bookings.filter((booking) => new Date(booking.trip.dateTime) >= new Date());
  const past = bookings.filter((booking) => new Date(booking.trip.dateTime) < new Date());

  const downloadTicket = async (id: string) => {
    if (!accessToken) return;
    try {
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
    } catch (error) {
      alert("Failed to download ticket");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return null;
  }

  // Format booking ID (using last 8 characters, similar to SLK79012)
  const formatBookingId = (id: string) => {
    const idString = String(id);
    return `SLK${idString.slice(-8)}`;
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Your Profile Section */}
        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-avatar">
            <div className="profile-avatar__circle">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="profile-avatar__image" />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </div>
            </div>
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            <Link to="/account" className="profile-link">
              Manage Profile
            </Link>
          </div>
        </section>

        {/* Bookings Sections */}
        <div className="bookings-sections">
          {/* Upcoming Bookings */}
          <section className="bookings-section">
            <h2 className="bookings-section__title">Upcoming Bookings</h2>
            {status === "loading" ? (
              <p>Loading bookings...</p>
            ) : upcoming.length === 0 ? (
              <p className="bookings-empty">No upcoming bookings.</p>
            ) : (
              <div className="bookings-grid">
                {upcoming.map((booking) => (
                  <BookingProfileCard
                    key={booking.id}
                    booking={booking}
                    isUpcoming={true}
                    formatBookingId={formatBookingId}
                    onCancel={() => dispatch(cancelBooking(booking.id))}
                    onDownload={() => downloadTicket(booking.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Past Bookings */}
          <section className="bookings-section">
            <h2 className="bookings-section__title">Past Bookings</h2>
            {past.length === 0 ? (
              <p className="bookings-empty">No past bookings.</p>
            ) : (
              <div className="bookings-grid">
                {past.map((booking) => (
                  <BookingProfileCard
                    key={booking.id}
                    booking={booking}
                    isUpcoming={false}
                    formatBookingId={formatBookingId}
                    onCancel={() => {}}
                    onDownload={() => downloadTicket(booking.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

interface BookingProfileCardProps {
  booking: Booking;
  isUpcoming: boolean;
  formatBookingId: (id: string) => string;
  onCancel: () => void;
  onDownload: () => void;
}

const BookingProfileCard = ({ booking, isUpcoming, formatBookingId }: BookingProfileCardProps) => {
  const formattedDate = format(new Date(booking.trip.dateTime), "yyyy-MM-dd");
  const departureTime = format(new Date(booking.trip.dateTime), "hh:mm a");
  
  // Calculate arrival time
  const duration = booking.trip.duration || "2h 30min";
  const durationMatch = duration.match(/(\d+)h\s*(\d+)?min?/);
  let hours = 2;
  let minutes = 30;
  if (durationMatch) {
    hours = parseInt(durationMatch[1] || "2", 10);
    minutes = parseInt(durationMatch[2] || "30", 10);
  }
  const arrivalTime = new Date(booking.trip.dateTime);
  arrivalTime.setHours(arrivalTime.getHours() + hours);
  arrivalTime.setMinutes(arrivalTime.getMinutes() + minutes);
  const formattedArrivalTime = format(arrivalTime, "hh:mm a");

  const formattedSeats = booking.seats.map(formatSeatLabel).join(", ");
  const bookingId = formatBookingId(booking.id);

  return (
    <div className={`booking-profile-card booking-profile-card--${isUpcoming ? "upcoming" : "past"}`}>
      <div className="booking-profile-card__header">
        <div className="booking-profile-card__id">Booking ID: {bookingId}</div>
        <span className={`booking-profile-card__badge booking-profile-card__badge--${isUpcoming ? "upcoming" : "completed"}`}>
          {isUpcoming ? "Upcoming" : "Completed"}
        </span>
      </div>
      <div className="booking-profile-card__body">
        <div className="booking-profile-card__detail">
          <LocationIcon />
          <span>
            {booking.trip.from} → {booking.trip.to}
          </span>
        </div>
        <div className="booking-profile-card__detail">
          <CalendarIcon />
          <span>{formattedDate}</span>
        </div>
        <div className="booking-profile-card__detail">
          <ClockIcon />
          <span>
            {departureTime} - {formattedArrivalTime}
          </span>
        </div>
        <div className="booking-profile-card__seats">Seats: {formattedSeats}</div>
      </div>
      <div className={`booking-profile-card__footer booking-profile-card__footer--${isUpcoming ? "upcoming" : "past"}`}>
        {isUpcoming ? <AirplaneIcon /> : <BusIcon />}
      </div>
    </div>
  );
};

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 3v4M17 3v4M4 11h16M6 21h12a2 2 0 0 0 2-2V7.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2Z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 6v6l3.5 2" />
  </svg>
);

const AirplaneIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.8 19.2 16 11l3.5-3.5C19.6 7 19 7 19 7H6c0 0-.6 0-1.5.5L8 11l-1.8 8.2c0 .3.3.8.8.8h1c.5 0 .7-.5.8-.8L10 14h4l.2 5.2c0 .3.3.8.8.8h1c.6 0 .8-.5.8-.8Z" />
    <path d="M6 12h12" />
  </svg>
);

const BusIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.8 19.2 16 11l3.5-3.5C19.6 7 19 7 19 7H6c0 0-.6 0-1.5.5L8 11l-1.8 8.2c0 .3.3.8.8.8h1c.5 0 .7-.5.8-.8L10 14h4l.2 5.2c0 .3.3.8.8.8h1c.6 0 .8-.5.8-.8Z" />
    <path d="M6 12h12" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="18" r="1" />
  </svg>
);

export default ProfilePage;
