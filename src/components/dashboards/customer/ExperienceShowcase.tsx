import React from 'react';

interface ExperienceShowcaseProps {
  onExploreVenues: () => void;
}

export const ExperienceShowcase: React.FC<ExperienceShowcaseProps> = ({ onExploreVenues }) => {
  return (
    <section className="space-y-4" data-purpose="atmosphere-showcase">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-serif text-[#081C15] font-semibold flex items-center gap-2.5">
          <span className="text-sm text-[#081C15] leading-none">•</span>
          <span>The MayFlower Experience</span>
        </h2>
        <span className="text-[11px] uppercase tracking-widest text-[#997E46] font-semibold font-sans hidden sm:inline-block">
          Private Dining &amp; Salons
        </span>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-[#E8E2D5] shadow-lg group bg-[#081C15]">
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img
            alt="MayFlower Heritage Dining & Salons"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            src="https://lh3.googleusercontent.com/aida/AEtjO1Wo3D-NxlZuevsKxWUQc0PzydoS3peIKmiYY6QtnfINRqzJH02yMjS0jyQlLRrPcoks-ukpVd6K5xWLyyhHQfFjxQqZOa5nNWJDBuHYrJTu72nmEU_bCgxQC3pO96YcOrOBKTFu19K5R4fqScnrXH4aKPDEVBcylGJeaLUSEUSH_sHUoCntMrsXi7J-tSUZiq1jax_EwSzs4k4oDLdcrB_MwsYmDDYbVFyhMy_SpJiZyTGzd7-K2F880LY"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081C15] via-[#081C15]/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#DFC993] block mb-1">
                POES GARDEN • PALAVAKKAM (ECR) • EGMORE • ANNA NAGAR
              </span>
              <p className="font-serif text-xl md:text-2xl font-semibold text-stone-100">
                British Heritage Fine Dining &amp; Bespoke Salons
              </p>
              <p className="text-xs text-stone-300 mt-1 max-w-xl font-light">
                Discover our four iconic destinations across Chennai for reserved tastings and memorable gatherings.
              </p>
            </div>

            <button
              onClick={onExploreVenues}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#DFC993] hover:text-white bg-[#081C15]/85 backdrop-blur-md border border-[#C5A880]/50 px-4 py-2.5 rounded hover:bg-[#081C15] transition-colors shrink-0 cursor-pointer shadow-sm"
              type="button"
            >
              <span>EXPLORE VENUES</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
