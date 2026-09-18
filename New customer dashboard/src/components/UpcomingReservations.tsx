import React from 'react';
import { Reservation } from '../types';

interface UpcomingReservationsProps {
  reservations: Reservation[];
  onModify: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
  onNewReservation: () => void;
}

export const UpcomingReservations: React.FC<UpcomingReservationsProps> = ({
  reservations,
  onModify,
  onCancel,
  onNewReservation,
}) => {
  const activeReservations = reservations.filter((r) => r.status !== 'CANCELLED');

  return (
    <section className="space-y-4" data-purpose="reservations-section">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-serif text-[#081C15] font-semibold flex items-center gap-2.5">
          <span className="text-sm text-[#081C15] leading-none">•</span>
          <span>Upcoming Reservations</span>
        </h2>
        {activeReservations.length > 0 && (
          <span className="text-xs font-medium text-stone-500 font-sans">
            {activeReservations.length} Active Booking{activeReservations.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {activeReservations.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E2D5] p-8 text-center shadow-sm space-y-3">
          <p className="font-serif text-lg text-stone-800">You have no upcoming salon reservations.</p>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Experience the culinary artistry of MayFlower. Reserve an afternoon tea or fine dining tasting experience.
          </p>
          <button
            onClick={onNewReservation}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#081C15] text-[#DFC993] hover:text-white border border-[#C5A880]/40 text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer"
          >
            Reserve a Table
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeReservations.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-xl border border-[#E8E2D5] overflow-hidden shadow-md hover:border-[#C5A880]/60 transition-colors"
            >
              <div className="flex flex-col md:flex-row">
                {/* Visual Photography Preview */}
                <div className="md:w-72 lg:w-80 relative min-h-[190px] md:min-h-full shrink-0 overflow-hidden bg-stone-100">
                  <img
                    alt={res.salon}
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                    src={res.imageUrl}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
                  <div className="absolute top-3 left-3 hidden md:block">
                    <span className="bg-[#081C15]/85 backdrop-blur-md text-[#DFC993] border border-[#C5A880]/40 text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded">
                      {res.salonTag}
                    </span>
                  </div>
                </div>

                {/* Reservation Details & Controls */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                  <div className="space-y-3">
                    {/* Tag & Ref */}
                    <div className="flex items-center gap-3">
                      <span className="bg-[#081C15] text-[#8FD8B0] text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded border border-[#1A3E2A]">
                        {res.status}
                      </span>
                      <span className="text-xs text-stone-500 font-medium tracking-wide">
                        Ref: {res.ref}
                      </span>
                    </div>

                    {/* Venue / Location Title */}
                    <h3 className="text-2xl font-serif font-bold text-[#081C15]">
                      {res.salon}
                    </h3>

                    {/* Details List */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-600 font-normal pt-1">
                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-[#C5A880]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="font-medium text-stone-800">{res.date}</span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-[#C5A880]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{res.time}</span>
                      </div>

                      {/* Guests */}
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-[#C5A880]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{res.guests} Guests</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => onModify(res)}
                      className="px-5 py-2 rounded-md border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-[#FAF7F2] hover:border-[#C5A880] hover:text-[#081C15] transition-all uppercase tracking-wider cursor-pointer"
                      type="button"
                    >
                      MODIFY
                    </button>
                    <button
                      onClick={() => onCancel(res)}
                      className="px-5 py-2 rounded-md border border-rose-200 bg-rose-50/60 text-xs font-semibold text-rose-600 hover:bg-rose-100/70 hover:border-rose-300 transition-colors uppercase tracking-wider cursor-pointer"
                      type="button"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
