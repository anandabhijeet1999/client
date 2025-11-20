import { format } from "date-fns";
import type { Booking } from "../types";
import { Link } from "react-router-dom";

interface Props {
  booking: Booking;
  onCancel: (id: string) => void;
  onDownloadTicket: (id: string) => void;
}

const BookingCard = ({ booking, onCancel, onDownloadTicket }: Props) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>
          {booking.trip.from} → {booking.trip.to}
        </h3>
        <p>{format(new Date(booking.trip.dateTime), "EEE, dd MMM yyyy HH:mm")}</p>
      </div>
      <div className="card-body">
        <p>Seats: {booking.seats.join(", ")}</p>
        <p>Status: {booking.status}</p>
        <p>Total Paid: ₹{booking.payment.amount}</p>
      </div>
      <div className="card-footer">
        <button type="button" className="ghost-button" onClick={() => onDownloadTicket(booking.id)}>
          View Ticket
        </button>
        {booking.status === "confirmed" && (
          <button type="button" className="danger-button" onClick={() => onCancel(booking.id)}>
            Cancel
          </button>
        )}
        <Link to={`/trips/${booking.trip._id}`} className="secondary-button">
          Book Again
        </Link>
      </div>
    </div>
  );
};

export default BookingCard;

