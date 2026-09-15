import React, { useState } from 'react';
import {
  Receipt,
  FileSpreadsheet,
  Award,
  ShieldCheck,
  Search,
  RotateCw,
  Eye,
  X,
  Calendar,
  Sparkles,
  HeartHandshake,
  UtensilsCrossed,
  Wine,
} from 'lucide-react';
import { CustomerProfile } from '../types';
import { INITIAL_CUSTOMERS } from '../data/mockData';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'GREEN' | 'GOLD' | 'BLACK'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'spend' | 'visits'>('date');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  const filteredCustomers = customers
    .filter((cust) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        cust.name.toLowerCase().includes(query) ||
        cust.email.toLowerCase().includes(query) ||
        cust.phone.toLowerCase().includes(query) ||
        cust.guestId.toLowerCase().includes(query);

      const matchesTier = tierFilter === 'ALL' || cust.tier === tierFilter;
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      if (sortBy === 'spend') return b.totalSpend - a.totalSpend;
      if (sortBy === 'visits') return b.visits - a.visits;
      return 0; // Default date
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Subtitle description */}
      <div className="text-xs text-[#5D6B64] font-medium">
        Registered dining guests across Mayflower loyalty ecosystem • Chennai Private Enclaves &amp; Flagships
      </div>

      {/* 4 Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="customer-telemetry">
        {/* Card 1: Total Patron Spend */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E6DF] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6B7973]">
              TOTAL PATRON SPEND
            </p>
            <h3 className="text-2xl font-serif font-semibold text-[#182420] mt-0.5">
              ₹82,000
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-1">
              • Verified POS Transactions
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F3EFE6] text-[#A68336] flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Average Table Yield */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E6DF] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6B7973]">
              AVERAGE TABLE YIELD
            </p>
            <h3 className="text-2xl font-serif font-semibold text-[#182420] mt-0.5">
              ₹4,555
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-medium mt-1">
              Across 18 Total Covers
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EFF4F1] text-[#2E5443] flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Accumulated Reward Pts */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E6DF] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6B7973]">
              ACCUMULATED REWARD PTS
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <h3 className="text-2xl font-serif font-semibold text-[#182420]">2,300</h3>
              <span className="text-xs font-mono text-zinc-500">pts</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-medium mt-1">
              No redemption claims pending
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FAF3E8] text-[#B88728] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Audited Registry Node */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E6DF] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6B7973]">
              AUDITED REGISTRY NODE
            </p>
            <h3 className="text-lg font-serif font-semibold text-[#182420] mt-1">
              Chennai Enclaves
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-mono mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Poes Garden &amp; ECR Live
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Tier Filter Bar */}
      <div className="bg-white rounded-xl border border-[#E8E5DD] p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              id="input-customer-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guests by name, phone (+91), or email handle..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D9D6CB] bg-[#FAF9F6] text-[#222E2A] placeholder-zinc-400 focus:bg-white focus:border-[#22332D] focus:ring-1 focus:ring-[#22332D]"
            />
          </div>

          {/* Tier Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500 text-[11px] font-mono mr-1">TIER:</span>
            <button
              onClick={() => setTierFilter('GREEN')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition ${
                tierFilter === 'GREEN'
                  ? 'bg-[#14261F] text-white shadow-2xs font-semibold'
                  : 'bg-[#F5F2EC] hover:bg-[#EBE6DC] text-[#33423B]'
              }`}
            >
              Green
            </button>
            <button
              onClick={() => setTierFilter('GOLD')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition ${
                tierFilter === 'GOLD'
                  ? 'bg-[#C29B38] text-white shadow-2xs font-semibold'
                  : 'bg-[#F5F2EC] hover:bg-[#EBE6DC] text-[#33423B]'
              }`}
            >
              Gold Reserve
            </button>
            <button
              onClick={() => setTierFilter('BLACK')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition ${
                tierFilter === 'BLACK'
                  ? 'bg-black text-white shadow-2xs font-semibold'
                  : 'bg-[#F5F2EC] hover:bg-[#EBE6DC] text-[#33423B]'
              }`}
            >
              Privé Black
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-60">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-[#D9D6CB] bg-white text-[#25322E] focus:border-[#22332D] focus:ring-1 focus:ring-[#22332D]"
            >
              <option value="date">Sort: Date Joined (Recent First)</option>
              <option value="spend">Sort: Highest Total Spend</option>
              <option value="visits">Sort: Most Frequent Visits</option>
            </select>
          </div>

          {/* Refresh icon */}
          <button
            onClick={() => {
              setSearchQuery('');
              setTierFilter('ALL');
            }}
            title="Reset filters"
            className="p-2 rounded-lg border border-[#D9D6CB] hover:bg-[#F4EFE6] text-zinc-600 transition cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Records Table */}
      <div className="bg-white rounded-xl border border-[#E3E0D6] shadow-xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-6 py-4 bg-[#FAF8F4] border-b border-[#ECE7DC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C29B38]" />
            <h3 className="font-serif font-semibold text-base text-[#18231F]">
              Customer Records
            </h3>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#697871]">
            SHOWING {filteredCustomers.length} OF {customers.length} PROFILES
          </span>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#ECE7DC] text-[11px] font-mono text-[#6A7871] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">GUEST NAME</th>
                <th className="py-3 px-4 font-semibold">EMAIL &amp; CONTACT</th>
                <th className="py-3 px-4 font-semibold">TIER STATUS</th>
                <th className="py-3 px-4 font-semibold">POINTS</th>
                <th className="py-3 px-4 font-semibold">VISITS</th>
                <th className="py-3 px-4 font-semibold">BOOKINGS</th>
                <th className="py-3 px-4 font-semibold">TOTAL SPEND</th>
                <th className="py-3 px-4 font-semibold">AVG SPEND</th>
                <th className="py-3 px-4 font-semibold">LAST VISIT</th>
                <th className="py-3 px-4 font-semibold">JOINED DATE</th>
                <th className="py-3 px-4 font-semibold text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE2] text-xs">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#FAF9F5] transition-colors">
                  {/* Guest Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#F1EDE4] text-[#785E22] font-serif font-bold text-xs flex items-center justify-center border border-[#DDD5C5]">
                        {cust.initials}
                      </div>
                      <div>
                        <div className="font-serif font-semibold text-sm text-[#18231F]">
                          {cust.name}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-400">
                          ID: {cust.guestId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email & Contact */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-xs text-[#2A3832]">{cust.email}</div>
                    <div className="font-mono text-[11px] text-zinc-500">{cust.phone}</div>
                  </td>

                  {/* Tier */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#14261F] text-[#4ADE80] border border-[#2B4B3D]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {cust.tierLabel}
                    </span>
                  </td>

                  {/* Points */}
                  <td className="py-3.5 px-4 font-mono font-medium text-[#7E611E]">
                    ★ {cust.points}
                  </td>

                  {/* Visits */}
                  <td className="py-3.5 px-4 font-mono text-[#32403A]">
                    {cust.visits}
                  </td>

                  {/* Bookings */}
                  <td className="py-3.5 px-4 font-mono text-[#32403A]">
                    {cust.bookings}
                  </td>

                  {/* Total Spend */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#182520]">
                    ₹{cust.totalSpend.toLocaleString('en-IN')}
                  </td>

                  {/* Avg Spend */}
                  <td className="py-3.5 px-4 font-mono text-zinc-600">
                    ₹{cust.avgSpend.toLocaleString('en-IN')}
                  </td>

                  {/* Last Visit */}
                  <td className="py-3.5 px-4 text-[#44534D]">
                    {cust.lastVisit}
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4 text-[#44534D]">
                    {cust.joinedDate}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      id={`btn-view-customer-${cust.id}`}
                      onClick={() => setSelectedCustomer(cust)}
                      title="Inspect guest dossier"
                      className="p-1.5 rounded-md hover:bg-[#EAE4D7] text-zinc-500 hover:text-[#18231F] transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#FAF9F5] border-t border-[#ECE7DC] flex items-center justify-between text-xs text-[#5D6B65]">
          <div>Page 1 of 1</div>
          <div className="inline-flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-[#DCD9CE] bg-white text-zinc-400 cursor-not-allowed">
              &lt;
            </button>
            <button className="px-2.5 py-1 rounded border border-[#DCD9CE] bg-white text-zinc-400 cursor-not-allowed">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Guest Dossier Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#C29B38] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE7DC] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#16221E] text-[#D8B45A] font-serif font-bold text-base flex items-center justify-center">
                  {selectedCustomer.initials}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#18231F]">
                    {selectedCustomer.name}
                  </h3>
                  <div className="font-mono text-xs text-zinc-500">
                    ID: {selectedCustomer.guestId} • Tier: {selectedCustomer.tierLabel}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2 bg-[#FAF8F3] rounded-lg p-3 border border-[#E8E2D5] text-xs">
              <div>
                <span className="text-zinc-400 uppercase text-[10px] font-mono">LIFETIME SPEND</span>
                <p className="font-mono font-bold text-base text-[#18231F]">
                  ₹{selectedCustomer.totalSpend.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] font-mono">VISITS &amp; COVERS</span>
                <p className="font-mono font-bold text-base text-[#18231F]">
                  {selectedCustomer.visits} Visits • {selectedCustomer.bookings} Bookings
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-[#E8E4DA] bg-white">
                <HeartHandshake className="w-4 h-4 text-[#C29B38] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#202E28]">VIP Hospitality Notes</div>
                  <div className="text-zinc-600 mt-0.5 leading-relaxed">{selectedCustomer.vipNotes}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-[#E8E4DA] bg-white">
                <UtensilsCrossed className="w-4 h-4 text-[#C29B38] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#202E28]">Preferred Seating Alcove</div>
                  <div className="text-zinc-600 mt-0.5">{selectedCustomer.preferredSeating}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-[#E8E4DA] bg-white">
                <Wine className="w-4 h-4 text-[#C29B38] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#202E28]">Sommelier Reserve Affinity</div>
                  <div className="text-zinc-600 mt-0.5">{selectedCustomer.favoriteWine}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#ECE7DC]">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-lg bg-[#0E1914] text-white text-xs font-medium cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
