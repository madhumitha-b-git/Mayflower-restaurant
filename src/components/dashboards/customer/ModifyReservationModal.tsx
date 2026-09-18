import React, { useState, useEffect } from 'react';
import { Reservation } from './types';

interface ModifyReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onSaveModifiedReservation: (
    reservationId: string,
    updatedData: { date: string; time: string; guests: number; notes?: string }
  ) => void;
}

const TIME_SLOTS = [
  '12:30 PM (Luncheon Tasting)',
  '1:00 PM (Luncheon)',
  '2:30 PM (Afternoon Tea)',
  '4:00 PM (Afternoon Tea)',
  '6:30 PM (Sunset Aperitifs)',
  '7:30 PM (Dinner)',
  '8:00 PM (Sovereign Dinner)',
  '9:30 PM (Sommelier Cellar Tasting)',
];

export const ModifyReservationModal: React.FC<ModifyReservationModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onSaveModifiedReservation,
}) => {
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [guests, setGuests] = useState<number>(2);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (reservation) {
      setDate(reservation.date || new Date().toISOString().split('T')[0]);
      setTime(reservation.time || '7:30 PM (Dinner)');
      setGuests(reservation.guests || 2);
      setNotes(reservation.notes || '');
    }
  }, [reservation, isOpen]);

  if (!isOpen || !reservation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveModifiedReservation(reservation.id, {
      date,
      time,
      guests,
      notes,
    });
    onClose();
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
    >
      <div className="fixed inset-0 bg-[#081C15]/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#C5A880]/50 overflow-hidden z-10 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#061610] via-[#0D2818] to-[#081C15] text-white px-6 sm:px-7 py-5 border-b border-[#C5A880]/30 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#DFC993] font-semibold block mb-0.5">
              RESERVATION MANAGEMENT
            </span>
            <h3 className="text-xl font-serif font-bold text-stone-100">
              Modify Table Details · {reservation.salon}
            </h3>
          </div>
          <button
            aria-label="Close modal"
            className="w-8 h-8 rounded-full border border-[#C5A880]/40 text-[#DFC993] hover:text-white hover:bg-[#C5A880]/20 flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {/* Reservation summary chip */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4EFE6] border border-[#E8E2D5] text-xs">
            <div>
              <p className="font-serif font-bold text-[#081C15]">{reservation.salon}</p>
              <p className="text-stone-500 font-mono text-[11px] mt-0.5">Booking Ref: {reservation.ref}</p>
            </div>
            <span className="text-[10px] tracking-widest uppercase font-bold text-[#8FD8B0] bg-[#081C15] px-2.5 py-1 rounded border border-[#1E5438]">
              {reservation.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
                Reservation Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-[#E8E2D5] rounded-lg p-2.5 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none cursor-pointer"
              />
            </div>

            {/* Time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
                Time Slot
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-[#E8E2D5] rounded-lg p-2.5 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none cursor-pointer"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
                {!TIME_SLOTS.includes(time) && time && (
                  <option value={time}>{time}</option>
                )}
              </select>
            </div>
          </div>

          {/* Guests Count */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
              Number of Guests
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setGuests(num)}
                  className={`w-10 h-10 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    guests === num
                      ? 'bg-[#081C15] text-[#DFC993] border border-[#C5A880] shadow-sm'
                      : 'bg-white text-stone-700 border border-[#E8E2D5] hover:border-[#C5A880]'
                  }`}
                >
                  {num}
                </button>
              ))}
              <span className="text-xs text-stone-500 font-serif italic ml-2">
                {guests} Guest{guests > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
              Special Requests & Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Window table, anniversary celebration..."
              className="w-full text-xs font-medium text-stone-800 bg-white border border-[#E8E2D5] rounded-lg p-2.5 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-white transition-colors uppercase tracking-wider cursor-pointer"
              type="button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#081C15] hover:bg-[#0D2818] text-[#DFC993] hover:text-white border border-[#C5A880]/50 text-xs font-semibold uppercase tracking-widest shadow-md transition-all cursor-pointer"
            >
              Update Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
