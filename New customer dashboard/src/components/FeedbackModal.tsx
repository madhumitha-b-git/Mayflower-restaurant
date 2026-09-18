import React, { useState } from 'react';
import { PatronProfile, ReviewMemory } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  patron: PatronProfile;
  onSubmit: (feedback: {
    salon: string;
    experienceType: string;
    rating: number;
    notes: string;
    attachedMemory?: ReviewMemory;
  }) => void;
}

const RATING_DESCRIPTORS: Record<number, string> = {
  1: 'Needs Attention (1 / 5)',
  2: 'Fair Experience (2 / 5)',
  3: 'Pleasant (3 / 5)',
  4: 'Distinguished (4 / 5)',
  5: 'Exceptional (5 / 5)',
};

const SALON_OPTIONS = [
  'Poes Garden Salon',
  'Palavakkam ECR Seaside',
  'Flagship Grand Salon',
];

const EXPERIENCE_OPTIONS = [
  'Fine Dining Tasting',
  'Afternoon Tea',
  'Private Salon Celebration',
  'Sommelier Wine Pairing',
];

const MEMORY_PRESETS: ReviewMemory[] = [
  {
    title: 'ECR Seaside Terrace Sunset',
    subtitle: 'Candlelit oceanfront terrace table',
    imageUrl:
      'https://lh3.googleusercontent.com/aida/AEtjO1XW-PaWkerRX2rvFgm1YiLEKzo5LKFtMeTwMs7UiL6mhBQmcC9lbh-mMmopPY6Axaih3QQJvZJLq-mdcjNJV0lkD6d0GM4CmajtbU08da42C-tGwMh2UFcISgk52hMt3mo_zpQFrrCoeVW39FSWDg2p0XyuSM7qlEXhXtrzfjy6H1eD4eEG7ew3t-eFhUYJh0ggjPCLpbdKF2q3uHm2oH1j2khFg7JFK4uzGYuZVS8tekVuTXpiceih4Bg',
  },
  {
    title: 'Poes Garden High Tea Spread',
    subtitle: 'Classic Devonshire cream scones & rare tea',
    imageUrl:
      'https://lh3.googleusercontent.com/aida/AEtjO1Wo3D-NxlZuevsKxWUQc0PzydoS3peIKmiYY6QtnfINRqzJH02yMjS0jyQlLRrPcoks-ukpVd6K5xWLyyhHQfFjxQqZOa5nNWJDBuHYrJTu72nmEU_bCgxQC3pO96YcOrOBKTFu19K5R4fqScnrXH4aKPDEVBcylGJeaLUSEUSH_sHUoCntMrsXi7J-tSUZiq1jax_EwSzs4k4oDLdcrB_MwsYmDDYbVFyhMy_SpJiZyTGzd7-K2F880LY',
  },
  {
    title: 'Flagship Sommelier Cellar',
    subtitle: 'Grand tasting room and premier vintages',
    imageUrl:
      'https://lh3.googleusercontent.com/aida/AEtjO1XKIlQBg8XDWITGCIcXI6RJC_RINGskS7HFz_6rq_LI4WMvZ3BqiEPW08_fkxqfIjyp5jsZ6zRJAQ-AEMHP_1XqncR6UGUOOwxqaichKeou8aGL_gWOj-ReFqc8Rru0UxozJi4PyVEXIbP9wypwYPJ_sIAfE5Bs9UTP0zRNll_fy8GZLCTUIbLaTxNp6pdyHqgO19bnaH6jWRVPydTBya32inEkSmbflUk207E_x8B_X8fPT_ukjEe1hXY',
  },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  patron,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<string>('Poes Garden Salon');
  const [selectedExperience, setSelectedExperience] = useState<string>('Fine Dining Tasting');
  const [notes, setNotes] = useState<string>('');
  const [includeMemory, setIncludeMemory] = useState<boolean>(true);
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number>(0);

  const [isSalonOpen, setIsSalonOpen] = useState<boolean>(false);
  const [isExpOpen, setIsExpOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      salon: selectedSalon,
      experienceType: selectedExperience,
      rating,
      notes,
      attachedMemory: includeMemory ? MEMORY_PRESETS[selectedMemoryIndex] : undefined,
    });
    setNotes('');
    onClose();
  };

  const activeStars = hoverRating ?? rating;

  return (
    <div
      aria-labelledby="feedbackModalTitle"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
    >
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-[#081C15]/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Window */}
      <div
        className="relative w-full max-w-xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#C5A880]/50 overflow-visible z-10 my-auto"
        id="feedbackModalBox"
      >
        {/* Header with Emerald Noir Accent */}
        <div className="bg-gradient-to-r from-[#061610] via-[#0D2818] to-[#081C15] text-white px-6 sm:px-7 py-5 border-b border-[#C5A880]/30 flex items-center justify-between relative overflow-hidden rounded-t-2xl">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[#C5A880]/10 blur-xl pointer-events-none" />
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#DFC993] font-semibold block mb-0.5">
              MAYFLOWER PATRON RELATIONS
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-100" id="feedbackModalTitle">
              Share Your Dining Experience
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

        {/* Modal Form Body */}
        <form className="p-5 sm:p-7 space-y-5" onSubmit={handleSubmit}>
          {/* Patron Identifier subtle banner */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F4EFE6] border border-[#E8E2D5] text-xs">
            <div className="flex items-center gap-2">
              <span className="font-cormorant text-lg font-bold text-[#DFC993] bg-[#081C15] w-6 h-6 rounded-full inline-flex items-center justify-center italic">
                {patron.monogram}
              </span>
              <span className="text-stone-700 font-medium">
                Patron: <strong className="text-[#081C15]">{patron.name}</strong>
              </span>
            </div>
            <span className="text-[10px] tracking-widest uppercase font-bold text-[#8FD8B0] bg-[#081C15] px-2 py-0.5 rounded border border-[#1E5438]">
              {patron.tier} Tier
            </span>
          </div>

          {/* Rating Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
              Overall Experience Rating
            </label>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`text-2xl transition-transform hover:scale-110 focus:outline-none cursor-pointer ${
                    star <= activeStars ? 'text-[#C5A880]' : 'text-stone-300'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  title={`${star} Star${star > 1 ? 's' : ''}`}
                  type="button"
                >
                  ★
                </button>
              ))}
              <span className="text-xs text-stone-500 font-serif italic ml-2">
                {RATING_DESCRIPTORS[activeStars] || `${activeStars} / 5`}
              </span>
            </div>
          </div>

          {/* Salon Location & Experience Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Custom Select 1: Salon / Venue */}
            <div className="space-y-1.5 relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
                Salon / Venue
              </label>
              <button
                aria-expanded={isSalonOpen}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-[#E8E2D5] rounded-lg px-3.5 py-2.5 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none flex items-center justify-between shadow-xs hover:border-[#C5A880]/70 transition-colors cursor-pointer text-left"
                onClick={() => {
                  setIsSalonOpen(!isSalonOpen);
                  setIsExpOpen(false);
                }}
                type="button"
              >
                <span className="text-[#081C15] font-medium">{selectedSalon}</span>
                <svg
                  className={`w-4 h-4 text-[#C5A880] transition-transform duration-200 shrink-0 ${
                    isSalonOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isSalonOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#0e2118]/95 backdrop-blur-md border border-[#c5a059]/30 rounded-xl shadow-2xl py-1.5 text-xs text-stone-200 overflow-hidden">
                  <div className="px-3 py-1 text-[9px] uppercase tracking-widest text-[#DFC993]/60 font-semibold border-b border-[#c5a059]/15 mb-1">
                    Select Venue
                  </div>
                  {SALON_OPTIONS.map((salon) => (
                    <div
                      key={salon}
                      className={`px-3.5 py-2 hover:bg-[#1a382b] hover:text-[#f8f5ee] cursor-pointer transition-colors flex items-center justify-between ${
                        selectedSalon === salon ? 'text-[#DFC993] font-medium' : 'text-stone-200'
                      }`}
                      onClick={() => {
                        setSelectedSalon(salon);
                        setIsSalonOpen(false);
                      }}
                      role="option"
                    >
                      <span>{salon}</span>
                      {selectedSalon === salon && (
                        <svg
                          className="w-3.5 h-3.5 text-[#DFC993]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Select 2: Experience Type */}
            <div className="space-y-1.5 relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]">
                Experience Type
              </label>
              <button
                aria-expanded={isExpOpen}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-[#E8E2D5] rounded-lg px-3.5 py-2.5 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none flex items-center justify-between shadow-xs hover:border-[#C5A880]/70 transition-colors cursor-pointer text-left"
                onClick={() => {
                  setIsExpOpen(!isExpOpen);
                  setIsSalonOpen(false);
                }}
                type="button"
              >
                <span className="text-[#081C15] font-medium">{selectedExperience}</span>
                <svg
                  className={`w-4 h-4 text-[#C5A880] transition-transform duration-200 shrink-0 ${
                    isExpOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isExpOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#0e2118]/95 backdrop-blur-md border border-[#c5a059]/30 rounded-xl shadow-2xl py-1.5 text-xs text-stone-200 overflow-hidden">
                  <div className="px-3 py-1 text-[9px] uppercase tracking-widest text-[#DFC993]/60 font-semibold border-b border-[#c5a059]/15 mb-1">
                    Select Experience
                  </div>
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <div
                      key={exp}
                      className={`px-3.5 py-2 hover:bg-[#1a382b] hover:text-[#f8f5ee] cursor-pointer transition-colors flex items-center justify-between ${
                        selectedExperience === exp ? 'text-[#DFC993] font-medium' : 'text-stone-200'
                      }`}
                      onClick={() => {
                        setSelectedExperience(exp);
                        setIsExpOpen(false);
                      }}
                      role="option"
                    >
                      <span>{exp}</span>
                      {selectedExperience === exp && (
                        <svg
                          className="w-3.5 h-3.5 text-[#DFC993]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes / Compliments Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#081C15]"
                htmlFor="patronNotes"
              >
                Dining Notes &amp; Compliments
              </label>
              <span className="text-[10px] text-stone-400 italic font-serif">
                Confidential to Maitre d'
              </span>
            </div>
            <textarea
              className="w-full text-xs text-stone-800 bg-white border border-[#E8E2D5] rounded-lg p-3 h-24 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] outline-none resize-none leading-relaxed placeholder:text-stone-400"
              id="patronNotes"
              placeholder="Share your reflections regarding the culinary execution, hospitality, cellar pairings, or ambience..."
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Attach Dining Memory / Photo */}
          <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E8E2D5] space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-800">
                <input
                  type="checkbox"
                  checked={includeMemory}
                  onChange={(e) => setIncludeMemory(e.target.checked)}
                  className="rounded border-[#C5A880] text-[#081C15] focus:ring-[#C5A880]"
                />
                <span>Attach Dining Memory Photograph</span>
              </label>
              <span className="text-[10px] uppercase font-bold text-[#997E46]">
                +50 Mayflower Stars
              </span>
            </div>

            {includeMemory && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {MEMORY_PRESETS.map((mem, idx) => (
                  <button
                    key={mem.title}
                    type="button"
                    onClick={() => setSelectedMemoryIndex(idx)}
                    className={`p-1 rounded border text-left cursor-pointer transition-all ${
                      selectedMemoryIndex === idx
                        ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30 bg-white'
                        : 'border-[#E8E2D5] bg-stone-50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={mem.imageUrl}
                      alt={mem.title}
                      className="w-full h-12 object-cover rounded"
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-[9px] font-semibold text-[#081C15] truncate mt-1">
                      {mem.title}
                    </p>
                  </button>
                ))}
              </div>
            )}
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
              <span>Submit Feedback</span>
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
