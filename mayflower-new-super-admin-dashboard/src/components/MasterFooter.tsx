import React from 'react';

export const MasterFooter: React.FC = () => {
  return (
    <footer
      id="master-footer"
      className="mt-auto border-t border-[#E8E4DA] bg-white py-6 px-6 text-center"
      data-purpose="editorial-footer"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#6C7973]">
        <p className="font-serif text-[#24332D] text-sm tracking-wide font-medium">
          Mayflower Sanctuaries Executive Command
        </p>
        <p className="tracking-wide">
          Poes Garden • Palavakkam ECR • Anna Nagar East • Velachery Lakeside
        </p>
        <div className="flex items-center gap-4">
          <p className="font-mono text-[11px] text-[#86948E]">
            SYSTEM INTEGRITY: ENCRYPTED (AES-256) • CHENNAI HQ
          </p>
          <span className="text-zinc-300 hidden sm:inline">•</span>
          <p className="font-mono text-[11px] text-[#86948E]">
            ISO/IEC 27001 Certified Auditing
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto text-center mt-2">
        <p className="text-[11px] text-[#9EA9A4]">
          © 2025 Mayflower Sanctuaries Private Dining Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
