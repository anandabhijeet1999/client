import { useMemo } from "react";
import clsx from "clsx";
import "../styles/SeatSelector.css";

interface Props {
  totalSeats: number;
  bookedSeats: string[];
  selectedSeats: string[];
  onToggleSeat: (seat: string) => void;
}

const SEATS_PER_ROW = 6;

const getRowLabel = (rowIndex: number) => {
  const baseCharCode = "A".charCodeAt(0);
  const cycleIndex = rowIndex % 26;
  const suffix = rowIndex >= 26 ? Math.floor(rowIndex / 26) + 1 : "";
  return `${String.fromCharCode(baseCharCode + cycleIndex)}${suffix}`;
};

const getSeatLabelByIndex = (seatIndex: number) => {
  const rowIndex = Math.floor(seatIndex / SEATS_PER_ROW);
  const columnIndex = (seatIndex % SEATS_PER_ROW) + 1;
  return `${getRowLabel(rowIndex)}${columnIndex}`;
};

export const formatSeatLabel = (seatId: string) => {
  const seatIndex = Number.parseInt(seatId, 10) - 1;
  if (Number.isNaN(seatIndex) || seatIndex < 0) {
    return seatId;
  }
  return getSeatLabelByIndex(seatIndex);
};

const SeatSelector = ({ totalSeats, bookedSeats, selectedSeats, onToggleSeat }: Props) => {
  const seatRows = useMemo(() => {
    if (totalSeats === 0) {
      return [];
    }

    const rowsNeeded = Math.ceil(totalSeats / SEATS_PER_ROW);
    return Array.from({ length: rowsNeeded }, (_, rowIndex) => {
      const label = getRowLabel(rowIndex);
      const seats = Array.from({ length: SEATS_PER_ROW }, (_, columnIndex) => {
        const seatIndex = rowIndex * SEATS_PER_ROW + columnIndex;
        if (seatIndex >= totalSeats) {
          return null;
        }
        const id = (seatIndex + 1).toString().padStart(2, "0");
        return {
          id,
          label: getSeatLabelByIndex(seatIndex),
          isBooked: bookedSeats.includes(id),
          isSelected: selectedSeats.includes(id),
        };
      });

      return { label, seats };
    });
  }, [totalSeats, bookedSeats, selectedSeats]);

  const columnLabels = useMemo(() => Array.from({ length: SEATS_PER_ROW }, (_, index) => index + 1), []);

  return (
    <div className="seat-selector">
      <div className="seat-selector__grid" role="grid" aria-label="Cabin seating">
        <div className="seat-selector__columns">
          <div className="seat-selector__spacer" />
          {columnLabels.map((column) => (
            <span key={column} className="seat-selector__column-label">
              {column}
            </span>
          ))}
        </div>
        {seatRows.map((row) => (
          <div key={row.label} className="seat-selector__row" role="row">
            <div className="seat-selector__row-label" aria-hidden="true">
              {row.label}
            </div>
            <div className="seat-selector__row-seats">
              {row.seats.map((seat, columnIndex) =>
                seat ? (
                  <button
                    key={seat.id}
                    type="button"
                    className={clsx("seat-grid__seat", {
                      "seat-grid__seat--booked": seat.isBooked,
                      "seat-grid__seat--selected": seat.isSelected,
                    })}
                    onClick={() => !seat.isBooked && onToggleSeat(seat.id)}
                    disabled={seat.isBooked}
                    aria-pressed={seat.isSelected}
                    aria-label={`Seat ${seat.label} ${seat.isBooked ? "booked" : seat.isSelected ? "selected" : "available"}`}
                  >
                    {seat.label}
                  </button>
                ) : (
                  <span
                    key={`placeholder-${row.label}-${columnIndex}`}
                    className="seat-grid__placeholder"
                    aria-hidden="true"
                  />
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="seat-legend">
        <span>
          <span className="seat-indicator seat-indicator--available" /> Available
        </span>
        <span>
          <span className="seat-indicator seat-indicator--selected" /> Selected
        </span>
        <span>
          <span className="seat-indicator seat-indicator--booked" /> Booked
        </span>
      </div>
    </div>
  );
};

export default SeatSelector;

