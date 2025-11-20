import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchBookings } from "../features/bookings/bookingSlice";
import { formatSeatLabel } from "../components/SeatSelector";
import type { Booking } from "../types";

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, lastCreated } = useAppSelector((state) => state.bookings);
  const { accessToken } = useAppSelector((state) => state.auth);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (!bookingId) {
      navigate("/bookings");
      return;
    }

    // First check if this is the last created booking
    if (lastCreated && lastCreated.id === bookingId) {
      setBooking(lastCreated);
      return;
    }

    // Try to find booking in state
    const foundBooking = items.find((b) => b.id === bookingId);
    if (foundBooking) {
      setBooking(foundBooking);
      return;
    }

    // If not found, fetch bookings from server
    dispatch(fetchBookings()).then((result) => {
      if (fetchBookings.fulfilled.match(result)) {
        const booking = result.payload.find((b) => b.id === bookingId);
        if (booking) {
          setBooking(booking);
        } else {
          // Booking not found, redirect to bookings page
          navigate("/bookings");
        }
      } else {
        // Error fetching, redirect to bookings page
        navigate("/bookings");
      }
    });
  }, [bookingId, items, lastCreated, dispatch, navigate]);

  useEffect(() => {
    if (booking) {
      // Generate QR code using a simple service or library
      // Using qrcode.js or a simple API - for now using a placeholder service
      const qrData = `${booking.id}|${booking.trip.from}|${booking.trip.to}|${booking.trip.dateTime}`;
      // Using a simple QR code generator API
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
    }
  }, [booking]);

  const handleDownloadTicket = async () => {
    if (!bookingId || !accessToken) return;

    try {
      const response = await fetch(`${apiBase}/bookings/${bookingId}/ticket`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download ticket");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `booking-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert((error as Error).message ?? "Failed to download ticket");
    }
  };

  const handleViewTicket = async () => {
    if (!bookingId || !accessToken) return;

    try {
      const response = await fetch(`${apiBase}/bookings/${bookingId}/ticket`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to view ticket");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Clean up URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      alert((error as Error).message ?? "Failed to view ticket");
    }
  };

  if (!booking) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-loading">
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  const formattedDate = format(new Date(booking.trip.dateTime), "MMMM dd, yyyy");
  const departureTime = format(new Date(booking.trip.dateTime), "hh:mm a");
  
  // Calculate arrival time (assuming 2h 30min duration, or use trip duration if available)
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

  const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const formattedSeats = booking.seats.map(formatSeatLabel).join(", ");
  
  // Generate booking ID in format #TXN789456 (using last 9 characters)
  // Ensure we have a valid booking ID string
  const bookingIdString = String(booking.id);
  const bookingIdNumeric = bookingIdString.slice(-9);
  const bookingIdDisplay = `#TXN${bookingIdNumeric}`;

  // Get airport codes (simplified - use common airport codes mapping)
  const airportCodes: Record<string, string> = {
    "New York": "LAX",
    "Boston": "SFO",
    "Los Angeles": "LAX",
    "San Francisco": "SFO",
    "Chicago": "ORD",
    "Miami": "MIA",
    "Atlanta": "ATL",
  };
  
  // Extract city name (remove any parentheses content)
  const extractCityName = (location: string) => {
    const match = location.match(/^([^(]+)/);
    return match ? match[1].trim() : location.trim();
  };
  
  const fromCity = extractCityName(booking.trip.from);
  const toCity = extractCityName(booking.trip.to);
  const fromCode = airportCodes[fromCity] || fromCity.slice(0, 3).toUpperCase();
  const toCode = airportCodes[toCity] || toCity.slice(0, 3).toUpperCase();

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        {/* Success Message */}
        <div className="confirmation-header">
          <div className="confirmation-checkmark">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="confirmation-title">Booking Confirmed!</h1>
          <p className="confirmation-subtitle">Your trip is successfully booked. Enjoy your journey!</p>
        </div>

        {/* Booking Card */}
        <div className="confirmation-card">
          {/* Card Header */}
          <div className="confirmation-card__header">
            <div className="confirmation-card__header-left">
              <h2>Flight Ticket</h2>
              <p>Booking ID: {bookingIdDisplay}</p>
            </div>
            <div className="confirmation-card__header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M17.8 19.2 16 11l3.5-3.5C19.6 7 19 7 19 7H6c0 0-.6 0-1.5.5L8 11l-1.8 8.2c0 .3.3.8.8.8h1c.5 0 .7-.5.8-.8L10 14h4l.2 5.2c0 .3.3.8.8.8h1c.6 0 .8-.5.8-.8Z" />
                <path d="M6 12h12" />
              </svg>
            </div>
          </div>

          {/* Card Body */}
          <div className="confirmation-card__body">
            {/* Route Section */}
            <div className="confirmation-route">
              <div className="confirmation-route__origin">
                <div className="confirmation-route__code">{fromCode}</div>
                <div className="confirmation-route__city">{fromCity}</div>
                <div className="confirmation-route__time">{departureTime}</div>
              </div>
              <div className="confirmation-route__middle">
                <div className="confirmation-route__line">
                  <div className="confirmation-route__line-dot" />
                  <div className="confirmation-route__line-dot" />
                  <div className="confirmation-route__line-dot" />
                  <div className="confirmation-route__line-dot" />
                  <div className="confirmation-route__airplane">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.8 19.2 16 11l3.5-3.5C19.6 7 19 7 19 7H6c0 0-.6 0-1.5.5L8 11l-1.8 8.2c0 .3.3.8.8.8h1c.5 0 .7-.5.8-.8L10 14h4l.2 5.2c0 .3.3.8.8.8h1c.6 0 .8-.5.8-.8Z" />
                      <path d="M6 12h12" />
                    </svg>
                  </div>
                  <div className="confirmation-route__line-dot" />
                  <div className="confirmation-route__line-dot" />
                  <div className="confirmation-route__line-dot" />
                  <div className="confirmation-route__line-dot" />
                </div>
                <div className="confirmation-route__duration">{duration}</div>
              </div>
              <div className="confirmation-route__destination">
                <div className="confirmation-route__code">{toCode}</div>
                <div className="confirmation-route__city">{toCity}</div>
                <div className="confirmation-route__time">{formattedArrivalTime}</div>
              </div>
            </div>

            {/* Details Section */}
            <div className="confirmation-details">
              <div className="confirmation-detail-item">
                <span className="confirmation-detail-item__label">Date:</span>
                <span className="confirmation-detail-item__value">{formattedDate}</span>
              </div>
              <div className="confirmation-detail-item">
                <span className="confirmation-detail-item__label">Seats:</span>
                <span className="confirmation-detail-item__value">{formattedSeats}</span>
              </div>
            </div>

            {/* Total Fare */}
            <div className="confirmation-fare">
              <span>Total Fare Paid</span>
              <strong style={{ color: "#10b981" }}>{currencyFormatter.format(booking.payment.amount)}</strong>
            </div>

            {/* QR Code */}
            <div className="confirmation-qr">
              {qrCodeUrl && (
                <div className="confirmation-qr__wrapper">
                  <img src={qrCodeUrl} alt="Booking QR Code" className="confirmation-qr__image" />
                </div>
              )}
              <p className="confirmation-qr__instruction">Scan this QR code at the boarding gate</p>
            </div>
          </div>

          {/* Card Footer - Action Buttons */}
          <div className="confirmation-card__footer">
            <button type="button" className="primary-button confirmation-button" onClick={handleDownloadTicket}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Ticket
            </button>
            <button type="button" className="secondary-button confirmation-button" onClick={handleViewTicket}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              View Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;

