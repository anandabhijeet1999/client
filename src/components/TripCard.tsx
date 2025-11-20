import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { Trip } from "../types";

interface Props {
  trip: Trip;
}

const destinationImages: Record<string, string> = {
  "atlanta-miami":
    "https://images.unsplash.com/photo-1476231790875-016a80c274f2?auto=format&fit=crop&w=800&q=80",
  "chicago-los angeles":
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
  "new york-boston":
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
  "boston-new york":
    "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&w=800&q=80",
};

const getTripImage = (from: string, to: string) => {
  const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
  return (
    destinationImages[key] ??
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
  );
};

const TripCard = ({ trip }: Props) => {
  const departureDate = format(new Date(trip.dateTime), "MMM dd, yyyy");
  const departureTime = format(new Date(trip.dateTime), "EEE, HH:mm");
  const availabilityRatio = trip.availableSeats / trip.totalSeats;
  const computedDiscount = availabilityRatio > 0.6 ? 25 : availabilityRatio > 0.4 ? 21 : 0;
  const numericDiscount = trip.discount ? Number.parseInt(trip.discount, 10) : computedDiscount;
  const isPopular = availabilityRatio < 0.35;
  const computedRating = Number((4.4 + ((trip.price % 7) / 20)).toFixed(1));
  const computedReviews = 80 + ((trip.totalSeats * 3) % 90);
  const durationHours = Math.max(2, Math.round(trip.price / 75));
  const rating = trip.rating ?? computedRating;
  const reviews = trip.reviews ?? computedReviews;
  const durationLabel = trip.duration ?? `${durationHours}h`;
  const discountLabel = trip.discount ?? (numericDiscount > 0 ? `${numericDiscount}% OFF` : null);
  const tagLabel = trip.tag ?? (isPopular ? "Popular" : null);
  const priceOld =
    trip.oldPrice ?? (numericDiscount > 0 ? Math.round(trip.price / (1 - numericDiscount / 100)) : null);
  const imageSrc = trip.image ?? getTripImage(trip.from, trip.to);

  return (
    <article className="trip-card">
      <div className="trip-card__image">
        <img src={imageSrc} alt={`${trip.from} to ${trip.to}`} loading="lazy" />
        {tagLabel && <span className="trip-badge trip-badge--popular">{tagLabel}</span>}
        {discountLabel && <span className="trip-badge trip-badge--discount">{discountLabel}</span>}
      </div>
      <div className="trip-card__body">
        {/* Rating with dynamic stars */}
        <div className="rating" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div className="stars" style={{ display: "flex", gap: "2px" }}>
            {Array.from({ length: Math.floor(rating) }).map((_, i) => (
              <FullStarIcon key={`full-${i}`} />
            ))}

            {rating % 1 >= 0.5 && <HalfStarIcon />}

            {Array.from({ length: 5 - Math.floor(rating) - (rating % 1 >= 0.5 ? 1 : 0) }).map((_, i) => (
              <EmptyStarIcon key={`empty-${i}`} />
            ))}
          </div>

          <span style={{ fontWeight: 600 }}>{rating.toFixed(1)}</span>
          <small style={{ color: "#666" }}>({reviews} reviews)</small>
        </div>

        <div className="trip-card__header">
          <div>
            <h3>
              {trip.from} • {trip.to}
            </h3>
            <p className="meta">
              {departureDate} · {departureTime}
            </p>
          </div>
        </div>

        <div className="trip-card__stats">
          <Stat icon={<ClockIcon />} label="Duration" value={durationLabel} />
          <Stat icon={<SeatIcon />} label="Seats left" value={trip.availableSeats} />
          <Stat icon={<CalendarIcon />} label="Departure" value={departureDate} />
        </div>

        <div className="trip-card__footer">
          <div className="price">
            <span className="price-current">${trip.price}</span>
            {priceOld && <span className="price-old">${priceOld}</span>}
          </div>
          <Link to={`/trips/${trip._id}`} className="primary-button">
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="trip-stat">
    <span className="trip-stat__icon">{icon}</span>
    <div>
      <p className="trip-stat__label">{label}</p>
      <p className="trip-stat__value">{value}</p>
    </div>
  </div>
);

// Full Star SVG (filled yellow)
const FullStarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f5b100" aria-hidden="true" >
    <path d="m12 2 2.72 6.79 7.28.55-5.53 4.74 1.72 7.21L12 17.77 5.81 20.8l1.72-7.22L2 9.33l7.28-.55L12 2Z" />
  </svg>
);

// Half Star SVG with gradient fill
const HalfStarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="halfGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="50%" stopColor="#f5b100" />
        <stop offset="50%" stopColor="#ddd" />
      </linearGradient>
    </defs>
    <path
      fill="url(#halfGradient)"
      d="m12 2 2.72 6.79 7.28.55-5.53 4.74 1.72 7.21L12 17.77 
         5.81 20.8l1.72-7.22L2 9.33l7.28-.55L12 2Z"
    />
  </svg>
);

// Empty Star SVG with gray fill
const EmptyStarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ddd" aria-hidden="true">
    <path d="m12 2 2.72 6.79 7.28.55-5.53 4.74 1.72 7.21L12 17.77 
       5.81 20.8l1.72-7.22L2 9.33l7.28-.55L12 2Z" />
  </svg>
);

// Other icons remain same as your original code
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 6v6l3.5 2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const SeatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="5" y="3" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 14v3h10v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 17h14v2H5z" fill="currentColor" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 3v4M17 3v4M4 11h16M6 21h12a2 2 0 0 0 2-2V7.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TripCard;
