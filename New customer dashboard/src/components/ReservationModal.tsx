import React, { useState, useEffect } from 'react';
import { Reservation, SalonVenue } from '../types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: SalonVenue[];
  editingReservation?: Reservation | null;
  onSaveReservation: (reservation: Omit<Reservation, 'id'>, idToUpdate?: string) => void;
  preselectedVenueId?: string;
}

const TIME_SLOTS = [
  '12:30 PM (Luncheon Tasting)',
  '2:30 PM (Afternoon Tea)',
  '4:00 PM (Afternoon Tea)',
  '6:30 PM (Sunset Aperitifs)',
  '8:00 PM (Sovereign Dinner)',
  '9:30 PM (Sommelier Cellar Tasting)',
];

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  venues,
  editingReservation,
  onSaveReservation,
  preselectedVenueId,
}) => {
  const [salonId, setSalonId] = useState<string>('poes-garden');
  const [date, setDate] = useState<string>('2026-09-18');
  const [time, setTime] = useState<string>('4:00 PM (Afternoon Tea)');
  const [guests, setGuests] = useState<number>(2);
  const [notes, setNotes] = useState<string>('');
  const [sommelierPairing, setSommelierPairing] = useState<boolean>(false);

  useEffect(() => {
    if (editingReservation) {
      const matchedVenue = venues.find(
        (v) => v.name.toLowerCase().includes(editingReservation.salon.toLowerCase()) ||
               editingReservation.salon.toLowerCase().includes(v.name.toLowerCase())
      );
      if (matchedVenue) setSalonId(matchedVenue.id);
      setDate(editingReservation.date);
      setTime(editingReservation.time);
      setGuests(editingReservation.guests);
      setNotes(editingReservation.notes || '');
      setSommelierPairing(!!editingReservation.sommelierPairing);
    } else if (preselectedVenueId) {
      setSalonId(preselectedVenueId);
      setDate('2026-09-18');
      setTime('4:00 PM (Afternoon Tea)');
      setGuests(2);
      setNotes('');
      setSommelierPairing(false);
    } else {
      setSalonId('poes-garden');
      setDate('2026-09-18');
      setTime('4:00 PM (Afternoon Tea)');
      setGuests(2);
      setNotes('');
      setSommelierPairing(false);
    }
  }, [editingReservation, preselectedVenueId, isOpen, venues]);

  if (!isOpen) return null;

  const currentVenue = venues.find((v) => v.id === salonId) || venues[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanRef = editingReservation?.ref || `#MF-${Math.floor(1000 + Math.random() * 9000)}`;

    onSaveReservation(
      {
        ref: cleanRef,
        salon: currentVenue.name.replace(' Salon', ''),
        salonTag: currentVenue.tag,
        date,
        time,
        experienceType: time.includes('Tea') ? 'Afternoon Tea' : 'Fine Dining Tasting',
        guests,
        status: 'CONFIRMED',
        imageUrl: currentVenue.imageUrl,
        notes,
        sommelierPairing,
      },
      editingReservation?.id
    );

    onClose();
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
    >
      <div className="fixed inset-0 bg-[#081C15]/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#C5A880]/50 overflow-hidden z-10 my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#061610] via-[#0D2818] to-[#081C15] text-white px-6 sm:px-8 py-5 border-b border-[#C5A880]/30 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#DFC993] font-semibold block mb-0.5">
              THE MAYFLOWER SALONS
            </span>
            <h3 className="text-xl font-serif font-bold text-stone-100">
              {editingReservation ? 'Modify Your Reservation' : 'Reserve a Salon Table'}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Venue Selection with Visual Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
              Select MayFlower Salon
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {venues.map((venue) => {
                const isSelected = venue.id === salonId;
                return (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => setSalonId(venue.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#C5A880] bg-[#081C15] text-white shadow-md ring-2 ring-[#C5A880]/40'
                        : 'border-[#E8E2D5] bg-white text-stone-800 hover:border-[#C5A880]/60'
                    }`}
                  >
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-[#DFC993]' : 'text-[#997E46]'
                      }`}
                    >
                      {venue.tag}
                    </span>
                    <p
                      className={`text-sm font-serif font-semibold mt-1 ${
                        isSelected ? 'text-stone-100' : 'text-[#081C15]'
                      }`}
                    >
                      {venue.name}
                    </p>
                    <p
                      className={`text-[10px] mt-2 line-clamp-1 ${
                        isSelected ? 'text-stone-300' : 'text-stone-500'
                      }`}
                    >
                      {venue.location}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
                Reservation Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-[#E8E2D5] rounded-lg p-2.5 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none"
              />
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
                Dining Service / Time
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-[#E8E2D5] rounded-lg p-2.5 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Guests Counter */}
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
                {guests} Patron{guests > 1 ? 's' : ''} reserved
              </span>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
                Special Dining Requests &amp; Seating Preference
              </label>
              <span className="text-[10px] text-stone-400 italic">Optional</span>
            </div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Window table, anniversary celebration, allergy notes..."
              className="w-full text-xs font-medium text-stone-800 bg-white border border-[#E8E2D5] rounded-lg p-2.5 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none"
            />
          </div>

          {/* Sommelier Cellar Pairing Add-on */}
          <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#C5A880]/40 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-[#081C15]">
              <input
                type="checkbox"
                checked={sommelierPairing}
                onChange={(e) => setSommelierPairing(e.target.checked)}
                className="rounded border-[#C5A880] text-[#081C15] focus:ring-[#C5A880] w-4 h-4"
              />
              <div>
                <p className="font-semibold text-[#081C15]">Bespoke Sommelier Wine Flight</p>
                <p className="text-[10px] text-stone-500 font-normal">
                  4 curated vintage pours matched to your culinary service
                </p>
              </div>
            </label>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#997E46] bg-white px-2 py-1 rounded border border-[#C5A880]/30 shrink-0">
              +100 Stars
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              className="px-5 py-2.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-[#FAF7F2] hover:text-[#081C15] transition-colors uppercase tracking-wider cursor-pointer"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 rounded-lg bg-[#081C15] hover:bg-[#0D2818] text-[#DFC993] hover:text-white border border-[#C5A880]/50 text-xs font-semibold uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"
              type="submit"
            >
              <span>{editingReservation ? 'Confirm Changes' : 'Confirm Table'}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
