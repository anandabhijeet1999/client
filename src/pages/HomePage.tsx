import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import TripCard from "../components/TripCard";
import { fetchTrips, setFilters } from "../features/trips/tripSlice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";

const LocationIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 12.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.5 9c0 6-7.5 12.75-7.5 12.75S4.5 15 4.5 9a7.5 7.5 0 0 1 15 0Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// const CalendarIcon = () => (
//   <svg
//     width="16"
//     height="16"
//     viewBox="0 0 24 24"
//     fill="none"
//     aria-hidden="true"
//   >
//     <path
//       d="M7 3v4M17 3v4M4 11h16M6 21h12a2 2 0 0 0 2-2V7.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2Z"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { items, status, filters } = useAppSelector((state) => state.trips);
  const [formState, setFormState] = useState(filters);

  useEffect(() => {
    dispatch(fetchTrips(filters));
  }, [dispatch, filters]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(setFilters(formState));
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>Find Your Next Journey</h1>
            <p>Discover available trips and book your seats with ease.</p>
          </div>
          <form className="search-card" onSubmit={handleSubmit}>
            <div className="input-field">
              <label htmlFor="from">From</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <LocationIcon />
                </span>
                <input
                  id="from"
                  type="text"
                  placeholder="Departure Location"
                  value={formState.from ?? ""}
                  onChange={(e) =>
                    setFormState({ ...formState, from: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="input-field">
              <label htmlFor="to">To</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <LocationIcon />
                </span>
                <input
                  id="to"
                  type="text"
                  placeholder="Arrival Location"
                  value={formState.to ?? ""}
                  onChange={(e) =>
                    setFormState({ ...formState, to: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="input-field">
              <label htmlFor="date">Date</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  {/* <CalendarIcon /> */}
                </span>
                <input
                  id="date"
                  type="date"
                  value={formState.date ?? ""}
                  onChange={(e) =>
                    setFormState({ ...formState, date: e.target.value })
                  }
                />
              </div>
            </div>
            <button type="submit" className="primary-button search-button">
              Search Trips
            </button>
          </form>
        </div>
      </section>

      <section className="trip-section">
        <div className="section-heading">
          <div>
            <h2 className="eyebrow">Available Trips</h2>
            <p>
              Choose from our carefully selected destinations and enjoy a
              comfortable journey.
            </p>
          </div>
        </div>
        {status === "loading" && <p>Loading trips...</p>}
        {items.length === 0 && status === "idle" && (
          <p>No trips yet. Admins can add trips via the Admin Panel.</p>
        )}
        <div className="trip-grid">
          {items.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
