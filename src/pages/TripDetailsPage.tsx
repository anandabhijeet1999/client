import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import SeatSelector, { formatSeatLabel } from "../components/SeatSelector";
import { fetchTripById } from "../features/trips/tripSlice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { setCheckoutTrip } from "../features/checkout/checkoutSlice";

const TripDetailsPage = () => {
  const { tripId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedTrip } = useAppSelector((state) => state.trips);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    if (tripId) {
      dispatch(fetchTripById(tripId));
    }
  }, [dispatch, tripId]);

  useEffect(() => {
    // Reset seat selection whenever the user opens a different trip.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedSeats([]);
  }, [selectedTrip?._id]);

  const toggleSeat = (seat: string) => {
    setSelectedSeats((prev) => (prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]));
  };

  const handleConfirmBooking = () => {
    if (!selectedTrip || selectedSeats.length === 0) return;
    dispatch(setCheckoutTrip({ trip: selectedTrip, seats: selectedSeats }));
    navigate("/checkout");
  };

  const tripImage = useMemo(() => {
    if (!selectedTrip?.image) {
      return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";
    }
    return selectedTrip.image;
  }, [selectedTrip]);

  const formattedDate = selectedTrip ? format(new Date(selectedTrip.dateTime), "MMMM dd, yyyy") : "";
  const formattedTime = selectedTrip ? format(new Date(selectedTrip.dateTime), "hh:mm a") : "";
  const formattedDay = selectedTrip ? format(new Date(selectedTrip.dateTime), "EEEE") : "";
  const currencyFormatter = useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }), []);
  const farePerSeat = selectedTrip ? currencyFormatter.format(selectedTrip.price) : "";

  if (!selectedTrip) {
    return <p>Loading trip details...</p>;
  }

  return (
    <div className="trip-details-page">
      <section className="trip-hero" aria-label="Trip destination">
        <img src={tripImage} alt={`${selectedTrip.from} to ${selectedTrip.to}`} />
      </section>

      <div className="trip-details-content">
        <section className="trip-info-card card">
          <div className="trip-info-card__header">
            <div>
              <p className="eyebrow">Trip Details</p>
              <h2>
                {selectedTrip.from} → {selectedTrip.to}
              </h2>
              <p className="trip-subtitle">
                {formattedDay}, {formattedDate} · {formattedTime}
              </p>
            </div>
            <div className="trip-fare">
              <span>Fare per seat</span>
              <strong>{farePerSeat}</strong>
            </div>
          </div>
          <div className="trip-info-grid">
            <InfoItem label="From" value={selectedTrip.from} helper="Departure City" />
            <InfoItem label="To" value={selectedTrip.to} helper="Arrival City" align="right" />
            <InfoItem label="Date" value={formattedDate} helper={formattedDay} />
            <InfoItem label="Time" value={formattedTime} helper="Local time" align="right" />
          </div>
        </section>

        <section className="seat-map-card card">
          <div className="seat-map-card__header">
            <div>
              <p className="eyebrow">Select Your Seat</p>
              <h3>Deluxe Cabin</h3>
              <p className="trip-subtitle">Pick adjacent seats for a smoother journey</p>
            </div>
            <div className="seat-availability">
              {selectedTrip.availableSeats} of {selectedTrip.totalSeats} seats available
            </div>
          </div>
          <SeatSelector
            totalSeats={selectedTrip.totalSeats}
            bookedSeats={selectedTrip.seatMap.bookedSeats}
            selectedSeats={selectedSeats}
            onToggleSeat={toggleSeat}
          />
        </section>

        <section className="booking-summary card">
          <div className="booking-summary__header">
            <div>
              <p className="eyebrow">Selected Seats</p>
              <h3>{selectedSeats.length > 0 ? `${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""}` : "No seats selected"}</h3>
            </div>
            <div className="booking-summary__fare">
              <span>Estimated total</span>
              <strong>{currencyFormatter.format(selectedSeats.length * selectedTrip.price)}</strong>
            </div>
          </div>
          {selectedSeats.length > 0 ? (
            <ul className="booking-summary__list">
              {selectedSeats.map((seat) => (
                <li key={seat}>
                  <span>{formatSeatLabel(seat)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="booking-summary__placeholder">Choose seats in the cabin above to continue.</p>
          )}
          <button
            type="button"
            className="primary-button booking-summary__cta"
            disabled={selectedSeats.length === 0}
            onClick={handleConfirmBooking}
          >
            Confirm Booking
          </button>
        </section>
      </div>
    </div>
  );
};

const InfoItem = ({
  label,
  value,
  helper,
  align = "left",
}: {
  label: string;
  value: string;
  helper?: string;
  align?: "left" | "right";
}) => (
  <div className={`trip-info-item trip-info-item--${align}`}>
    <span className="trip-info-item__label">{label}</span>
    <strong className="trip-info-item__value">{value}</strong>
    {helper && <small className="trip-info-item__helper">{helper}</small>}
  </div>
);

export default TripDetailsPage;

