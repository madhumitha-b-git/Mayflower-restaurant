import { Home, Calendar, Utensils, MapPin } from 'lucide-react';
import { AppView } from '../types';

interface Props {
  activeView: AppView;
  onNavigate: (sectionId: string) => void;
  onOpenReservations: () => void;
  onBackToWebsite: () => void;
  canReserveTable?: boolean;
}

export function MobileBottomNav({
  activeView,
  onNavigate,
  onOpenReservations,
  onBackToWebsite,
  canReserveTable = true,
}: Props) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-md border-t border-[#D1CDBC]/10 px-4 py-2 flex items-center justify-around text-xs">
      <button
        onClick={() => {
          onBackToWebsite();
          onNavigate('hero');
        }}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeView === 'website' ? 'text-[#FAF7F2]' : 'text-[#8C857B]'
        }`}
      >
        <Home className="w-5 h-5 text-[#C5A880]" />
        <span>Home</span>
      </button>

      <button
        onClick={() => onNavigate('menu')}
        className="flex flex-col items-center gap-1 text-[#8C857B] hover:text-[#FAF7F2] transition-colors"
      >
        <Utensils className="w-5 h-5 text-[#C5A880]" />
        <span>Menu</span>
      </button>

      {canReserveTable && (
        <button
          onClick={onOpenReservations}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeView === 'reservations' ? 'text-[#FAF7F2]' : 'text-[#8C857B]'
          }`}
        >
          <Calendar className="w-5 h-5 text-[#C5A880]" />
          <span>Book</span>
        </button>
      )}

      <button
        onClick={() => onNavigate('outlets')}
        className="flex flex-col items-center gap-1 text-[#8C857B] hover:text-[#FAF7F2] transition-colors"
      >
        <MapPin className="w-5 h-5 text-[#C5A880]" />
        <span>Outlets</span>
      </button>
    </div>
  );
}
