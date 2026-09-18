import React from 'react';
import { Users, FileText, BarChart3, Search, Store } from 'lucide-react';
import { OutletName } from './types';

export type ActiveTab = 'directory' | 'requests' | 'activity';

interface FilterBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedOutlet: 'All' | OutletName;
  setSelectedOutlet: (outlet: 'All' | OutletName) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalFiltered: number;
  totalEmployees: number;
  pendingRequestsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeTab,
  setActiveTab,
  selectedOutlet,
  setSelectedOutlet,
  searchQuery,
  setSearchQuery,
  totalFiltered,
  totalEmployees,
  pendingRequestsCount,
}) => {
  const outlets: ('All' | OutletName)[] = [
    'All',
    'Poes Garden',
    'Palavakkam',
    'Anna Nagar',
    'Egmore',
  ];

  return (
    <div className="w-full space-y-4">
      {/* Top row: View Tabs on left & Salon Pills on right */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {/* Tab 1: Staff Directory & Shifts */}
          <button
            id="tab-directory"
            onClick={() => setActiveTab('directory')}
            className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'directory'
                ? 'bg-[#0B2B24] text-white shadow-sm'
                : 'text-[#4A5550] hover:text-[#0B2B24] hover:bg-black/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Directory & Shifts</span>
          </button>

          {/* Tab 2: Shift & Leave Requests */}
          <button
            id="tab-requests"
            onClick={() => setActiveTab('requests')}
            className={`cursor-pointer px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-[#0B2B24] text-white shadow-sm'
                : 'text-[#4A5550] hover:text-[#0B2B24] hover:bg-black/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Shift & Leave Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="bg-[#D4A359] text-[#132620] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ml-0.5">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          {/* Tab 3: Activity Log */}
          <button
            id="tab-activity"
            onClick={() => setActiveTab('activity')}
            className={`cursor-pointer px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'activity'
                ? 'bg-[#0B2B24] text-white shadow-sm'
                : 'text-[#4A5550] hover:text-[#0B2B24] hover:bg-black/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Activity Log</span>
          </button>
        </div>

        {/* Salon Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#69756F] uppercase tracking-wider whitespace-nowrap pl-1">
            <Store className="w-3.5 h-3.5 text-[#88948D]" />
            <span>Outlet:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {outlets.map((outlet) => {
              const isSelected = selectedOutlet === outlet;
              return (
                <button
                  key={outlet}
                  id={`filter-outlet-${outlet.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedOutlet(outlet)}
                  className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg transition-all whitespace-nowrap font-medium ${
                    isSelected
                      ? 'bg-[#C69C6D] text-white font-semibold shadow-xs'
                      : 'text-[#5A6660] hover:text-[#18231E] hover:bg-[#EAE5D9]'
                  }`}
                >
                  {outlet}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Bar & Result Count (Only for Directory tab) */}
      {activeTab === 'directory' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/95 border border-[#E8E3D8] rounded-xl px-4 py-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 flex-1">
            <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
            <input
              id="input-search-employees"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, or outlet location..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#1A2520] placeholder-[#9CA3AF] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#9CA3AF] hover:text-[#374151] px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-[#6B7280] font-medium shrink-0 self-end sm:self-center border-t sm:border-t-0 border-[#F3EFE6] pt-1.5 sm:pt-0">
            Showing <strong className="text-[#18231E]">{totalFiltered}</strong> of{' '}
            <strong className="text-[#18231E]">{totalEmployees}</strong> employees
          </div>
        </div>
      )}
    </div>
  );
};
