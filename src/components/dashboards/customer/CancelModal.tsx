import React from 'react';
import { Reservation } from './types';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onConfirmCancel: (reservationId: string) => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onConfirmCancel,
}) => {
  if (!isOpen || !reservation) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
    >
      <div className="fixed inset-0 bg-[#081C15]/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#C5A880]/50 overflow-hidden z-10 my-auto">
        <div className="p-6 sm:p-7 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-[#997E46] font-semibold">
              RESERVATION CANCELLATION
            </span>
            <h3 className="text-xl font-serif font-bold text-[#081C15]">
              Cancel Table at {reservation.salon}?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed pt-1">
              Are you sure you wish to release your reservation <strong>{reservation.ref}</strong> on{' '}
              {reservation.date} for {reservation.guests} guests?
            </p>
          </div>

          <div className="p-3 bg-[#F4EFE6] rounded-lg border border-[#E8E2D5] text-xs text-stone-600 text-left">
            <p className="font-semibold text-stone-800 mb-0.5">Cancellation Policy:</p>
            <p className="text-[11px] text-stone-500">
              Cancellations will release the reserved salon table immediately.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-white transition-colors uppercase tracking-wider cursor-pointer"
              type="button"
            >
              Keep Table
            </button>
            <button
              onClick={() => {
                onConfirmCancel(reservation.id);
                onClose();
              }}
              className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              type="button"
            >
              Cancel Reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
