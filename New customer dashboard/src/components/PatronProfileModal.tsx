import React, { useState } from 'react';
import { PatronProfile } from '../types';

interface PatronProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patron: PatronProfile;
  onUpdatePatron: (updated: Partial<PatronProfile>) => void;
}

export const PatronProfileModal: React.FC<PatronProfileModalProps> = ({
  isOpen,
  onClose,
  patron,
  onUpdatePatron,
}) => {
  const [preferredSeating, setPreferredSeating] = useState<string>(
    patron.preferredSeating || 'Quiet corner or Verandah booth'
  );
  const [dietaryInput, setDietaryInput] = useState<string>(
    patron.dietaryPreferences ? patron.dietaryPreferences.join(', ') : ''
  );

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const prefs = dietaryInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onUpdatePatron({
      preferredSeating,
      dietaryPreferences: prefs,
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

      <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#C5A880]/50 overflow-hidden z-10 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#061610] via-[#0D2818] to-[#081C15] text-white px-6 sm:px-7 py-5 border-b border-[#C5A880]/30 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#DFC993] font-semibold block mb-0.5">
              PATRON PROFILE &amp; PREFERENCES
            </span>
            <h3 className="text-xl font-serif font-bold text-stone-100">
              {patron.name} · Patron Account
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
        <form onSubmit={handleSave} className="p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F4EFE6] border border-[#E8E2D5]">
            <div className="w-14 h-14 rounded-full border border-[#C5A880] flex items-center justify-center bg-gradient-to-b from-[#0B2115] to-[#040E0A] shadow-inner shrink-0">
              <span className="font-cormorant text-2xl font-bold text-[#DFC993] italic">
                {patron.monogram}
              </span>
            </div>
            <div className="space-y-0.5">
              <h4 className="font-serif font-bold text-lg text-[#081C15]">{patron.name}</h4>
              <p className="text-xs text-stone-600">
                Mayflower Patron since {patron.memberSince} · {patron.tier} Tier Member
              </p>
              <p className="text-[11px] text-[#997E46] font-semibold font-sans">
                {patron.stars} Mayflower Stars Available
              </p>
            </div>
          </div>

          {/* Preferences Fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
                Dietary &amp; Sommelier Preferences
              </label>
              <input
                type="text"
                value={dietaryInput}
                onChange={(e) => setDietaryInput(e.target.value)}
                placeholder="Comma separated: e.g. Truffle Degustation, No Shellfish..."
                className="w-full text-xs font-medium text-stone-800 bg-white border border-[#E8E2D5] rounded-lg p-2.5 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none"
              />
              <p className="text-[10px] text-stone-400">
                Our kitchen &amp; Maître d' automatically observe these preferences on all reservations.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
                Preferred Seating Atmosphere
              </label>
              <select
                value={preferredSeating}
                onChange={(e) => setPreferredSeating(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-[#E8E2D5] rounded-lg p-2.5 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none"
              >
                <option value="Quiet corner or Verandah booth">Quiet corner or Verandah booth</option>
                <option value="Direct oceanfront terrace sunset table">Direct oceanfront terrace sunset table</option>
                <option value="Central Salon banquette under chandelier">Central Salon banquette under chandelier</option>
                <option value="Sommelier cellar tasting alcove">Sommelier cellar tasting alcove</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-white transition-colors uppercase tracking-wider cursor-pointer"
              type="button"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#081C15] hover:bg-[#0D2818] text-[#DFC993] hover:text-white border border-[#C5A880]/50 text-xs font-semibold uppercase tracking-widest shadow-md transition-all cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
