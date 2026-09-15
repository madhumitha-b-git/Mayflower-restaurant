import React, { useState } from 'react';
import {
  MapPin,
  Utensils,
  Clock,
  Radio,
  Plus,
  LayoutGrid,
  Settings,
  X,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Outlet } from '../types';
import { INITIAL_OUTLETS } from '../data/mockData';

export const OutletsView: React.FC = () => {
  const [outlets, setOutlets] = useState<Outlet[]>(INITIAL_OUTLETS);
  const [selectedFloorplanOutlet, setSelectedFloorplanOutlet] = useState<Outlet | null>(null);
  const [managedOutlet, setManagedOutlet] = useState<Outlet | null>(null);
  const [isAddOutletOpen, setIsAddOutletOpen] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleSyncAll = () => {
    setSyncToast('All 4 Sanctuary POS nodes synchronized successfully with Petpooja cloud.');
    setTimeout(() => setSyncToast(null), 3500);
  };

  const totalCovers = outlets.reduce((sum, o) => sum + o.coversCount, 0);
  const totalTables = outlets.reduce((sum, o) => sum + o.tablesCount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast notification */}
      {syncToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#162720] text-emerald-300 px-4 py-2.5 rounded-lg border border-emerald-500/40 shadow-xl flex items-center gap-2 text-xs font-mono animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E8E5DD]">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-[#18211E] tracking-tight">
            Overview
          </h2>
          <p className="text-sm text-[#5B6761] mt-1 leading-relaxed">
            4 active sanctuary dining destinations in Chennai with live cover management and POS links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF8F3] border border-[#E2DDCF] px-3.5 py-2 rounded-lg text-xs">
            <span className="font-mono font-semibold text-[#1F2C26]">
              {totalCovers} Total Covers / {totalTables} Tables
            </span>
            <span className="text-zinc-300">|</span>
            <button
              onClick={handleSyncAll}
              className="text-[#967C3B] hover:text-[#5F4C1B] font-medium transition cursor-pointer"
            >
              Sync All Outlets
            </button>
          </div>

          <button
            id="btn-add-outlet"
            onClick={() => setIsAddOutletOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0E1914] hover:bg-[#1A2F25] text-xs font-semibold text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C29B38]" />
            <span>Add New Outlet</span>
          </button>
        </div>
      </div>

      {/* 2x2 Outlets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-purpose="sanctuary-outlets-grid">
        {outlets.map((outlet) => (
          <div
            key={outlet.id}
            id={`outlet-card-${outlet.id}`}
            className="bg-white rounded-xl border border-[#E5E1D6] overflow-hidden shadow-xs hover:shadow-sm transition duration-200 flex flex-col"
          >
            <div className="p-6 pb-4 space-y-4 flex-1">
              {/* Top Badge & Status */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#8F7C4E] font-medium">
                  {outlet.typeLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#14261F] text-[#4ADE80]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ACTIVE
                </span>
              </div>

              {/* Sanctuary Title & Address */}
              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#18231F]">
                  {outlet.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#687670] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#967C3B] shrink-0" />
                  <span>{outlet.address}</span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#FAF8F4] rounded-lg border border-[#EDE8DC] text-xs">
                <div className="flex items-center gap-1.5 text-[#2E3C36] font-medium">
                  <Utensils className="w-3.5 h-3.5 text-[#967C3B]" />
                  <span>{outlet.tablesCount} Tables</span>
                  <span className="text-zinc-300">•</span>
                  <span>{outlet.coversCount} Covers</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{outlet.hours}</span>
                </div>
                <div className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span>{outlet.posId}</span>
                </div>
              </div>

              {/* Live Floor Load Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-[11px] text-[#55645E]">
                    LIVE FLOOR LOAD:{' '}
                    <strong className="text-[#18231F] font-bold">
                      {outlet.currentLoadTables} / {outlet.maxTables} Tables
                    </strong>
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#8C6D28]">
                    {outlet.capacityPercent}% CAPACITY
                  </span>
                </div>
                <div className="w-full bg-[#EAE5D9] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#C29B38] to-[#967C3B] h-full rounded-full"
                    style={{ width: `${outlet.capacityPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#697871] mt-1.5">
                  <span>{outlet.reservedWave}</span>
                  <span className="font-medium text-[#2E3C36]">{outlet.statusNote}</span>
                </div>
              </div>

              {/* Visual Photography Box */}
              <div className="relative rounded-lg overflow-hidden h-44 bg-zinc-900 shadow-inner group">
                <img
                  src={outlet.imageUrl}
                  alt={outlet.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#EADBBD] bg-black/60 px-2.5 py-1 rounded backdrop-blur-xs border border-white/10">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{outlet.verifiedTag}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-[#FAF9F5] border-t border-[#EDE8DE] flex items-center gap-2">
              <button
                id={`btn-manage-outlet-${outlet.id}`}
                onClick={() => setManagedOutlet(outlet)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#D9D6CB] bg-white hover:bg-[#F3EFE6] text-xs font-semibold text-[#22332C] transition cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#967C3B]" />
                <span>Manage Outlet</span>
              </button>

              <button
                id={`btn-floorplan-${outlet.id}`}
                onClick={() => setSelectedFloorplanOutlet(outlet)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#D9D6CB] bg-white hover:bg-[#F3EFE6] text-xs font-semibold text-[#22332C] transition cursor-pointer"
              >
                <span className="text-[#967C3B]">◇</span>
                <span>Table Floorplan</span>
              </button>

              <button
                onClick={() => setManagedOutlet(outlet)}
                title="Sanctuary configuration"
                className="p-2 rounded-lg border border-[#D9D6CB] bg-white hover:bg-[#F3EFE6] text-zinc-500 hover:text-zinc-800 transition cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Table Floorplan Modal */}
      {selectedFloorplanOutlet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#C29B38] max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ECE7DC] pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#967C3B]">
                  LIVE SALON OCCUPANCY MATRIX
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#18231F]">
                  {selectedFloorplanOutlet.name} — Floorplan
                </h3>
                <p className="text-xs text-[#5C6B64] mt-0.5">
                  {selectedFloorplanOutlet.currentLoadTables} of {selectedFloorplanOutlet.maxTables} tables occupied ({selectedFloorplanOutlet.capacityPercent}% capacity)
                </p>
              </div>
              <button
                onClick={() => setSelectedFloorplanOutlet(null)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Floorplan Legend */}
            <div className="flex items-center gap-4 text-xs bg-[#FAF8F4] p-3 rounded-lg border border-[#E9E4DA]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-800 border border-red-900"></span>
                <span>Occupied ({selectedFloorplanOutlet.tables.filter((t) => t.status === 'occupied').length})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#C29B38] border border-[#9A7620]"></span>
                <span>Reserved ({selectedFloorplanOutlet.tables.filter((t) => t.status === 'reserved').length})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-700"></span>
                <span>Available ({selectedFloorplanOutlet.tables.filter((t) => t.status === 'available').length})</span>
              </span>
            </div>

            {/* Visual Floor Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              {selectedFloorplanOutlet.tables.map((table) => {
                const isOccupied = table.status === 'occupied';
                const isReserved = table.status === 'reserved';
                return (
                  <div
                    key={table.id}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isOccupied
                        ? 'bg-[#FDF4F5] border-red-200'
                        : isReserved
                        ? 'bg-[#FAF6EC] border-[#E8DABF]'
                        : 'bg-[#F2F8F4] border-[#CCE4D5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif font-bold text-sm text-[#18231F]">
                        {table.number}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                          isOccupied
                            ? 'bg-red-800 text-white'
                            : isReserved
                            ? 'bg-[#967C3B] text-white'
                            : 'bg-emerald-700 text-white'
                        }`}
                      >
                        {table.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      Covers: {table.covers} • {table.type}
                    </div>
                    {table.guestName ? (
                      <div className="mt-2 text-xs font-semibold text-[#18231F] truncate">
                        {table.guestName}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-zinc-400 italic">No assigned party</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#ECE7DC]">
              <span className="font-mono text-xs text-zinc-500">
                Connected to {selectedFloorplanOutlet.posId}
              </span>
              <button
                onClick={() => setSelectedFloorplanOutlet(null)}
                className="px-4 py-2 rounded-lg bg-[#0E1914] text-white text-xs font-medium cursor-pointer"
              >
                Close Floorplan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Outlet Modal */}
      {managedOutlet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#C29B38] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE7DC] pb-3">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#18231F]">
                  Configure {managedOutlet.name}
                </h3>
                <p className="text-xs text-zinc-500">
                  Update timings, cover limits &amp; Petpooja POS bridge.
                </p>
              </div>
              <button
                onClick={() => setManagedOutlet(null)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  defaultValue={managedOutlet.hours}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Max Seating Covers
                  </label>
                  <input
                    type="number"
                    defaultValue={managedOutlet.coversCount}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Total Salon Tables
                  </label>
                  <input
                    type="number"
                    defaultValue={managedOutlet.tablesCount}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Status Headline
                </label>
                <input
                  type="text"
                  defaultValue={managedOutlet.statusNote}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECE7DC]">
              <button
                onClick={() => setManagedOutlet(null)}
                className="px-4 py-2 rounded-lg border border-[#D9D6CB] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setManagedOutlet(null);
                  setSyncToast(`Settings for ${managedOutlet.name} updated.`);
                  setTimeout(() => setSyncToast(null), 3000);
                }}
                className="px-4 py-2 rounded-lg bg-[#0E1914] text-white text-xs font-semibold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Outlet Modal */}
      {isAddOutletOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#C29B38] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE7DC] pb-3">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#18231F]">
                  Commission New Sanctuary Outlet
                </h3>
                <p className="text-xs text-zinc-500">
                  Provision physical dining destination and associate Petpooja POS terminal.
                </p>
              </div>
              <button
                onClick={() => setIsAddOutletOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddOutletOpen(false);
                setSyncToast('New sanctuary outlet provisioned and linked to Chennai HQ.');
                setTimeout(() => setSyncToast(null), 3000);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Sanctuary Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alwarpet Heritage Salon"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7 TTK Road, Alwarpet, Chennai"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Sanctuary Type
                  </label>
                  <input
                    type="text"
                    defaultValue="HERITAGE SALON"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Terminal POS ID
                  </label>
                  <input
                    type="text"
                    defaultValue="POS-05"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D9D6CB] bg-[#FAF9F6]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECE7DC]">
                <button
                  type="button"
                  onClick={() => setIsAddOutletOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#D9D6CB] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0E1914] text-white text-xs font-semibold cursor-pointer"
                >
                  Commission Outlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
