import React from 'react';
import {
  LayoutDashboard,
  Users,
  Star,
  Building2,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';
import { TabType } from '../types';

interface MainHeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'sops',
      label: 'SOPs & Checklists',
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Star className="w-4 h-4" />,
    },
    {
      id: 'outlets',
      label: 'Outlets',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'roles-permissions',
      label: 'Roles & Permissions',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
  ];

  return (
    <header
      id="main-app-header"
      className="bg-white border-b border-[#E8E6E0] shadow-xs sticky top-0 z-30"
      data-purpose="primary-navigation"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Location */}
        <button
          onClick={() => onSelectTab('overview')}
          className="flex items-center gap-4 text-left cursor-pointer group"
        >
          {/* Brand Monogram */}
          <div className="w-11 h-11 rounded-full bg-[#16221E] flex items-center justify-center text-[#C29B38] font-serif font-bold text-xl ring-2 ring-[#C29B38]/30 shadow-inner group-hover:ring-[#C29B38]/60 transition">
            M
          </div>
          <div>
            <h1 className="font-serif text-xl tracking-tight text-[#16221E] font-semibold flex items-center gap-2">
              Mayflower
              <span className="text-xs font-sans font-normal uppercase tracking-widest text-[#7B8580]">
                Sanctuaries
              </span>
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-[#8F7D50] font-medium">
              Chennai Flagship Division
            </p>
          </div>
        </button>
      </div>

      {/* Navigation Bar Menu */}
      <nav
        aria-label="Main Console Navigation"
        className="max-w-7xl mx-auto px-6 pt-1 flex items-center gap-1 border-t border-[#F0EFEB] overflow-x-auto"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={
                isActive
                  ? 'inline-flex items-center gap-2 px-4 py-1.5 my-1.5 text-xs font-semibold text-white bg-[#141C19] rounded-full shadow-xs cursor-pointer transition-all'
                  : 'inline-flex items-center gap-2 px-4 py-3 text-xs font-medium text-[#58625E] hover:text-[#182420] border-b-2 border-transparent transition-all cursor-pointer'
              }
            >
              <span className={isActive ? 'text-[#D8B45A]' : 'text-[#7C8782]'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
