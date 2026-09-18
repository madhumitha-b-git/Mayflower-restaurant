import React from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md bg-[#081C15] text-stone-100 border border-[#C5A880]/70 rounded-xl p-4 shadow-2xl flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      id="feedbackToast"
    >
      <div className="w-8 h-8 rounded-full bg-[#123824] text-[#8FD8B0] border border-[#1E5438] flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="space-y-0.5 flex-1 pr-2">
        <p className="text-[10px] uppercase font-bold tracking-widest text-[#DFC993]">
          {toast.title}
        </p>
        <p className="text-xs text-stone-200 leading-snug font-serif">
          {toast.message}
        </p>
      </div>
      <button
        aria-label="Dismiss toast"
        className="text-stone-400 hover:text-stone-100 text-xs p-1 cursor-pointer focus:outline-none"
        onClick={onDismiss}
        type="button"
      >
        ✕
      </button>
    </div>
  );
};
