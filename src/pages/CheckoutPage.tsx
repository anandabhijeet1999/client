import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { updatePaymentMethod, resetCheckout } from "../features/checkout/checkoutSlice";
import { createBooking } from "../features/bookings/bookingSlice";
import { formatSeatLabel } from "../components/SeatSelector";

const paymentOptions = [
  { 
    value: "card", 
    label: "Credit or Debit Card", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    )
  },
  { 
    value: "wallet", 
    label: "Digital Wallet (e.g., PayPal, Apple Pay)", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 8h20" stroke="white" strokeWidth="2" />
        <circle cx="7" cy="14" r="1.5" fill="white" />
      </svg>
    )
  },
];

const CheckoutPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { trip, seats, paymentMethod } = useAppSelector((state) => state.checkout);
  const { user } = useAppSelector((state) => state.auth);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
  });

  useEffect(() => {
    if (!trip) {
      navigate("/");
    }
  }, [trip, navigate]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const total = trip ? seats.length * trip.price : 0;
  const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setFormData((prev) => ({ ...prev, expiryDate: value }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setFormData((prev) => ({ ...prev, cvv: value }));
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert("Please fill in all required information fields");
      return;
    }

    if (paymentMethod === "card") {
      if (!formData.cardNumber || !formData.cardholderName || !formData.expiryDate || !formData.cvv) {
        alert("Please fill in all card details");
        return;
      }
    }

    if (paymentMethod === "wallet") {
      if (!formData.upiId) {
        alert("Please enter your UPI ID");
        return;
      }
    }

    setStatus("loading");
    try {
      const newBooking = await dispatch(createBooking({ tripId: trip._id, seats, paymentMethod })).unwrap();
      dispatch(resetCheckout());
      setStatus("success");
      navigate(`/booking-confirmed/${newBooking.id}`);
    } catch (error) {
      setStatus("idle");
      alert((error as Error).message ?? "Payment failed");
    }
  };

  if (!trip) {
    return null;
  }

  const formattedDate = format(new Date(trip.dateTime), "yyyy-MM-dd");
  const formattedTime = format(new Date(trip.dateTime), "hh:mm a");
  const formattedSeats = seats.map(formatSeatLabel).join(", ");

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Left Section: Checkout Form */}
        <div className="checkout-form-section">
          <h1 className="checkout-title">Checkout & Payment</h1>

            <form id="checkout-form" onSubmit={handleConfirm}>
            {/* Your Information */}
            <section className="checkout-section">
              <div className="checkout-section__header">
                <h2>Your Information</h2>
                <p className="checkout-section__subtitle">Please provide your contact details for this booking</p>
              </div>
              <div className="checkout-form-grid">
                <div className="form-field">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Your Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Your Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="checkout-section">
              <div className="checkout-section__header">
                <h2>Payment Method</h2>
              </div>
              <div className="payment-methods">
                {paymentOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`payment-method-option ${paymentMethod === option.value ? "payment-method-option--selected" : ""}`}
                    data-payment-type={option.value}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={paymentMethod === option.value}
                      onChange={() => dispatch(updatePaymentMethod(option.value))}
                    />
                    <span className="payment-method-option__icon" style={{ 
                      color: paymentMethod === option.value && option.value === "card" ? "#2563eb" : 
                             paymentMethod === option.value && option.value === "wallet" ? "#9333ea" : "#64748b"
                    }}>
                      {option.icon}
                    </span>
                    <span className="payment-method-option__label">{option.label}</span>
                  </label>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="card-details">
                  <div className="form-field">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="**** **** **** ****"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="cardholderName">Cardholder Name</label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      placeholder="Name"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="card-details__row">
                    <div className="form-field">
                      <label htmlFor="expiryDate">Expiry Date</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="cvv">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        placeholder="***"
                        value={formData.cvv}
                        onChange={handleCvvChange}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="card-details">
                  <div className="form-field">
                    <label htmlFor="upiId">UPI ID</label>
                    <input
                      type="text"
                      id="upiId"
                      name="upiId"
                      placeholder="username@bank"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              )}
            </section>
          </form>
        </div>

        {/* Right Section: Booking Summary */}
        <div className="checkout-summary-section">
          <div className="checkout-summary-card">
            <div className="checkout-summary-card__header">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="summary-header-icon">
                <path d="M17.8 19.2 16 11l3.5-3.5C19.6 7 19 7 19 7H6c0 0-.6 0-1.5.5L8 11l-1.8 8.2c0 .3.3.8.8.8h1c.5 0 .7-.5.8-.8L10 14h4l.2 5.2c0 .3.3.8.8.8h1c.6 0 .8-.5.8-.8Z" />
                <path d="M6 12h12" />
              </svg>
            </div>
            <h2 className="checkout-summary-card__title">Booking Summary</h2>

            <div className="booking-details">
              <DetailItem icon={<PinIcon />} label="Route" value={`${trip.from} to ${trip.to}`} />
              <DetailItem icon={<CalendarIcon />} label="Date" value={formattedDate} />
              <DetailItem icon={<ClockIcon />} label="Time" value={formattedTime} />
              <DetailItem icon={<BusIcon />} label="Transport" value="Flight" />
              <DetailItem icon={<SeatsIcon />} label="Seats" value={formattedSeats} />
            </div>

            <div className="checkout-summary-card__total">
              <span>Total Fare:</span>
              <strong style={{ color: "#2563eb" }}>{currencyFormatter.format(total)}</strong>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="primary-button checkout-summary-card__button"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Processing..." : "Complete Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="booking-detail-item">
    <span className="booking-detail-item__icon">{icon}</span>
    <div className="booking-detail-item__content">
      <span className="booking-detail-item__label">{label}</span>
      <span className="booking-detail-item__value">{value}</span>
    </div>
  </div>
);

const PinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 3v4M17 3v4M4 11h16M6 21h12a2 2 0 0 0 2-2V7.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2Z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 6v6l3.5 2" />
  </svg>
);

const BusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.8 19.2 16 11l3.5-3.5C19.6 7 19 7 19 7H6c0 0-.6 0-1.5.5L8 11l-1.8 8.2c0 .3.3.8.8.8h1c.5 0 .7-.5.8-.8L10 14h4l.2 5.2c0 .3.3.8.8.8h1c.6 0 .8-.5.8-.8Z" />
    <path d="M6 12h12" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="18" r="1" />
  </svg>
);

const SeatsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default CheckoutPage;
