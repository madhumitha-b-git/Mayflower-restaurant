import React, { useState } from 'react';
import {
  Users,
  Building2,
  ArrowRight,
  Utensils,
  Star,
} from 'lucide-react';
import { TabType, RecentActivity } from '../types';
import { INITIAL_RECENT_ACTIVITIES } from '../data/mockData';

interface OverviewViewProps {
  onNavigate: (tab: TabType) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const [selectedOutletFilter, setSelectedOutletFilter] = useState<string>('all');
  const [activities] = useState<RecentActivity[]>(INITIAL_RECENT_ACTIVITIES);

  const filteredActivities = activities.filter((act) => {
    if (selectedOutletFilter === 'all') return true;
    const outletLower = act.outlet.toLowerCase();
    if (selectedOutletFilter === 'poes') return outletLower.includes('poes');
    if (selectedOutletFilter === 'ecr') return outletLower.includes('palavakkam') || outletLower.includes('ecr');
    if (selectedOutletFilter === 'annanagar') return outletLower.includes('anna');
    if (selectedOutletFilter === 'velachery') return outletLower.includes('velachery');
    return true;
  });

  const outletFilterTabs = [
    { id: 'all', label: 'All Sanctuaries' },
    { id: 'poes', label: 'Poes Garden' },
    { id: 'ecr', label: 'Palavakkam ECR' },
    { id: 'annanagar', label: 'Anna Nagar East' },
    { id: 'velachery', label: 'Velachery' },
  ];

  const roleDistribution = [
    {
      id: 'owner',
      role: 'Owner',
      subtitle: 'Sanctuary trust holder & executive steering.',
      barColor: 'bg-[#B2873E]',
    },
    {
      id: 'admin',
      role: 'Admin',
      subtitle: 'System administration & protocol verification.',
      barColor: 'bg-[#2B3B34]',
    },
    {
      id: 'manager',
      role: 'Manager',
      subtitle: 'Day-to-day salon operations & guest...',
      barColor: 'bg-[#D9A354]',
    },
    {
      id: 'chef',
      role: 'Head Chef',
      subtitle: 'Culinary curation, courses & cellar pairings.',
      barColor: 'bg-[#10B981]',
    },
    {
      id: 'hr',
      role: 'HR Lead',
      subtitle: 'Appraisals, credentials & estate onboarding.',
      barColor: 'bg-[#556960]',
    },
    {
      id: 'comptroller',
      role: 'Comptroller',
      subtitle: 'Fiscal reconciliation, ledger balances & tax.',
      barColor: 'bg-[#8E5E32]',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Dark Forest Hero Banner */}
      <section
        id="overview-hero-banner"
        className="rounded-2xl bg-gradient-to-r from-[#11211B] via-[#162720] to-[#12221C] text-white p-8 border border-[#273F34] shadow-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-full opacity-10 bg-[radial-gradient(#C29B38_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-white">
              Executive Overview
            </h1>
          </div>

          {/* Metric Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-[#0A1612]/85 border border-[#233A30] rounded-xl p-3 sm:p-4 shrink-0">
            {/* Outlets */}
            <div className="bg-[#12221B]/80 border border-[#22392E] rounded-lg p-3 sm:w-36 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                <span>OUTLETS</span>
                <Building2 className="w-3.5 h-3.5 text-[#C29B38]" />
              </div>
              <div className="flex items-baseline gap-1.5 my-0.5">
                <span className="text-2xl font-serif font-bold text-white">4</span>
                <span className="text-[10px] font-sans text-zinc-400 uppercase">LOCATIONS</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>All Synchronized</span>
              </div>
            </div>

            {/* Staff Registry */}
            <div className="bg-[#12221B]/80 border border-[#22392E] rounded-lg p-3 sm:w-36 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                <span>STAFF REGISTRY</span>
                <Users className="w-3.5 h-3.5 text-[#C29B38]" />
              </div>
              <div className="flex items-baseline gap-1.5 my-0.5">
                <span className="text-2xl font-serif font-bold text-white">7</span>
                <span className="text-[10px] font-sans text-zinc-400 uppercase">ACCOUNTS</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>6 On Duty Today</span>
              </div>
            </div>

            {/* Guest Covers */}
            <div className="bg-[#12221B]/80 border border-[#22392E] rounded-lg p-3 sm:w-36 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                <span>GUEST COVERS</span>
                <Utensils className="w-3.5 h-3.5 text-[#C29B38]" />
              </div>
              <div className="flex items-baseline gap-1.5 my-0.5">
                <span className="text-2xl font-serif font-bold text-white">312</span>
                <span className="text-[10px] font-sans text-zinc-400 uppercase">TODAY</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-1">
                +14% vs last week
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section
        id="quick-actions-section"
        className="bg-white rounded-xl border border-[#E8E5DD] p-6 shadow-xs"
        data-purpose="quick-actions-controls"
      >
        <div className="mb-4">
          <h2 className="text-lg font-serif font-semibold text-[#18211E]">
            Quick Actions
          </h2>
        </div>

        {/* 3 Action Cards with real routing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Manage Staff Accounts */}
          <button
            id="quick-action-staff"
            onClick={() => onNavigate('staff')}
            className="text-left bg-[#FCFAF6] hover:bg-[#F6F2E9] border border-[#E8E3D7] hover:border-[#C29B38] rounded-xl p-5 transition-all duration-200 shadow-2xs group cursor-pointer"
          >
            <div className="mb-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E2DCD0] flex items-center justify-center text-[#21352E] group-hover:text-[#967C3B] transition">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-serif text-base font-semibold text-[#182420] group-hover:text-[#0C1A14] flex items-center justify-between">
              <span>Manage Staff Accounts</span>
              <ArrowRight className="w-4 h-4 text-[#C29B38] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-[#5E6C65] mt-1.5 leading-relaxed">
              Profiles, credential rotation, designated privileges &amp; direct shifts.
            </p>
          </button>

          {/* Card 2: Outlets & Layouts */}
          <button
            id="quick-action-outlets"
            onClick={() => onNavigate('outlets')}
            className="text-left bg-[#FCFAF6] hover:bg-[#F6F2E9] border border-[#E8E3D7] hover:border-[#C29B38] rounded-xl p-5 transition-all duration-200 shadow-2xs group cursor-pointer"
          >
            <div className="mb-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E2DCD0] flex items-center justify-center text-[#21352E] group-hover:text-[#967C3B] transition">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-serif text-base font-semibold text-[#182420] group-hover:text-[#0C1A14] flex items-center justify-between">
              <span>Outlets &amp; Layouts</span>
              <ArrowRight className="w-4 h-4 text-[#C29B38] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-[#5E6C65] mt-1.5 leading-relaxed">
              Salon floor plans, private dining alcoves, seating capacity &amp; estate timing.
            </p>
          </button>

          {/* Card 3: Manage Customers */}
          <button
            id="quick-action-customers"
            onClick={() => onNavigate('customers')}
            className="text-left bg-[#FCFAF6] hover:bg-[#F6F2E9] border border-[#E8E3D7] hover:border-[#C29B38] rounded-xl p-5 transition-all duration-200 shadow-2xs group cursor-pointer"
          >
            <div className="mb-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E2DCD0] flex items-center justify-center text-[#21352E] group-hover:text-[#967C3B] transition">
                <Star className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-serif text-base font-semibold text-[#182420] group-hover:text-[#0C1A14] flex items-center justify-between">
              <span>Manage Customers</span>
              <ArrowRight className="w-4 h-4 text-[#C29B38] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-[#5E6C65] mt-1.5 leading-relaxed">
              Patron profiles, dining preferences, VIP tier statuses &amp; dining reservations.
            </p>
          </button>
        </div>
      </section>

      {/* Recent Reservations */}
      <section
        id="recent-activities-section"
        className="bg-white rounded-xl border border-[#E8E5DD] p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-serif font-semibold text-[#18211E]">
              Recent Table Reservations
            </h2>
            <p className="text-xs text-[#5B6761] mt-0.5">
              Live reservations placed by sanctuary patrons.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF8F4] p-1 rounded-lg border border-[#E8E4D9]">
            {outletFilterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedOutletFilter(tab.id)}
                className={`px-3 py-1 text-xs rounded-md transition cursor-pointer font-medium ${
                  selectedOutletFilter === tab.id
                    ? 'bg-[#15231E] text-white shadow-2xs font-semibold'
                    : 'text-[#56655F] hover:text-[#182420] hover:bg-[#F2ECE0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reservations Table */}
        <div className="overflow-x-auto border border-[#ECE8DF] rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#ECE7DC] text-[11px] font-mono text-[#6C7A74] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">TIME</th>
                <th className="py-3 px-4 font-semibold">OUTLET</th>
                <th className="py-3 px-4 font-semibold">PATRON NAME</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFE8] text-xs">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500 font-mono text-xs">
                    No reservations recorded for this sanctuary.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[#57645E]">
                      {act.time}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF6EE] text-[#55431D] border border-[#E5DBCA]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B89058]"></span>
                        {act.outlet}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#1E2C26]">
                      {act.personName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F2F6F3] text-[#1E523A] border border-[#D0E2D7]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Reserved
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
