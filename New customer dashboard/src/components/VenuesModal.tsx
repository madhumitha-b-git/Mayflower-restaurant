import React from 'react';
import { SalonVenue } from '../types';

interface VenuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: SalonVenue[];
  onSelectVenueToReserve: (venueId: string) => void;
}

export const VenuesModal: React.FC<VenuesModalProps> = ({
  isOpen,
  onClose,
  venues,
  onSelectVenueToReserve,
}) => {
  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
    >
      <div className="fixed inset-0 bg-[#081C15]/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#C5A880]/50 overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#061610] via-[#0D2818] to-[#081C15] text-white px-6 sm:px-8 py-5 border-b border-[#C5A880]/30 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#DFC993] font-semibold block mb-0.5">
              EST. 2026 · PRIVATE DINING &amp; SALONS
            </span>
            <h3 className="text-xl font-serif font-bold text-stone-100">
              The MayFlower Salons Portfolio
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

        {/* Content list */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-xl border border-[#E8E2D5] overflow-hidden shadow-sm hover:border-[#C5A880]/60 transition-colors flex flex-col md:flex-row"
            >
              {/* Image Preview */}
              <div className="md:w-72 lg:w-80 h-56 md:h-auto shrink-0 relative overflow-hidden bg-stone-900">
                <img
                  src={venue.imageUrl}
                  alt={venue.name}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#081C15]/85 backdrop-blur-md text-[#DFC993] border border-[#C5A880]/40 text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded">
                    {venue.tag}
                  </span>
                </div>
              </div>

              {/* Information */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#997E46]">
                    {venue.location}
                  </span>
                  <h4 className="text-xl font-serif font-bold text-[#081C15]">{venue.name}</h4>
                  <p className="text-xs font-serif italic text-stone-600 font-medium">
                    {venue.headline}
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed font-light">
                    {venue.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600 border-t border-stone-100">
                    <div>
                      <strong className="text-stone-800">Hours:</strong> {venue.timing}
                    </div>
                    <div>
                      <strong className="text-stone-800">Dress Code:</strong> {venue.dressCode}
                    </div>
                  </div>

                  {/* Signature Offerings */}
                  <div className="pt-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Signature Selections
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {venue.signatureOfferings.map((sig) => (
                        <span
                          key={sig}
                          className="bg-[#FAF7F2] text-stone-700 border border-[#E8E2D5] text-[10px] px-2 py-0.5 rounded"
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reserve Action */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end">
                  <button
                    onClick={() => {
                      onSelectVenueToReserve(venue.id);
                    }}
                    className="px-5 py-2 rounded-lg bg-[#081C15] text-[#DFC993] hover:text-white border border-[#C5A880]/50 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Reserve {venue.name}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
