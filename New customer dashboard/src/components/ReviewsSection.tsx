import React from 'react';
import { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
  onOpenNewReview: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onOpenNewReview }) => {
  return (
    <section className="space-y-4" data-purpose="reviews-section">
      {/* Section Header with Add Action */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-serif text-[#081C15] font-semibold flex items-center gap-2.5">
          <span className="text-sm text-[#081C15] leading-none">•</span>
          <span>My Reviews</span>
        </h2>
        <button
          onClick={onOpenNewReview}
          className="bg-[#081C15] text-[#DFC993] hover:text-white border border-[#C5A880]/40 px-4 py-2 rounded text-xs font-medium uppercase tracking-wider hover:bg-[#0D2818] transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          type="button"
        >
          <span>+ NEW REVIEW</span>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-xl border border-[#E8E2D5] p-6 shadow-md hover:border-[#C5A880]/50 transition-colors space-y-4"
          >
            {/* Card Header: Title & Stars */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base md:text-lg font-serif font-bold text-[#081C15]">
                {rev.salon}
              </h3>
              {/* Gold Stars Rating */}
              <div
                aria-label={`${rev.rating} stars out of 5`}
                className="flex items-center text-[#C5A880] text-base gap-0.5"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= rev.rating ? 'text-[#C5A880]' : 'text-stone-300'}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Review Body & Visual Memory Attachment */}
            <div className="space-y-3">
              <p className="text-xs md:text-sm text-stone-700 font-normal leading-relaxed whitespace-pre-line">
                {rev.text}
              </p>

              {/* Attached Memory Preview */}
              {rev.attachedMemory && (
                <div className="mt-3 flex items-start gap-4 p-3 bg-[#FAF7F2] rounded-lg border border-[#E8E2D5]/80 max-w-lg">
                  <img
                    alt={rev.attachedMemory.title}
                    className="w-24 h-20 md:w-28 md:h-20 rounded object-cover shadow-sm shrink-0 border border-[#C5A880]/30"
                    src={rev.attachedMemory.imageUrl}
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#997E46]">
                      Attached Memory
                    </span>
                    <p className="text-xs font-serif font-semibold text-[#081C15]">
                      {rev.attachedMemory.title}
                    </p>
                    <p className="text-[11px] text-stone-500 line-clamp-1">
                      {rev.attachedMemory.subtitle}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
              <span>
                Visit: {rev.visitDate} {rev.formattedDate ? `· ${rev.formattedDate}` : ''}
              </span>
              {rev.isVerified && (
                <span className="text-stone-400 italic font-serif">Verified Patron Visit</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
