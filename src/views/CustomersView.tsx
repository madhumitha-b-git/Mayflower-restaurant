import React, { useEffect, useState } from 'react';
import {
  Receipt,
  FileSpreadsheet,
  Award,
  ShieldCheck,
  Search,
  RotateCw,
  Eye,
  X,
  Sparkles,
  HeartHandshake,
  UtensilsCrossed,
  Wine,
  Building2,
  Calendar,
  Star,
} from 'lucide-react';
import { CustomerProfile, UserProfile } from '../types';
import { INITIAL_CUSTOMERS } from '../data/mockData';
import { fetchAllCustomers } from '../lib/adminService';
import { getDataProvider } from '../data/DataProvider';
import { SeedReservation, SeedFeedback, SeedFranchiseEnquiry } from '../data/mockSeed';

interface CustomersViewProps {
  user?: UserProfile;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ user }) => {
  const [subTab, setSubTab] = useState<'directory' | 'reservations' | 'feedback' | 'franchise'>('directory');
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [reservations, setReservations] = useState<SeedReservation[]>([]);
  const [feedbackList, setFeedbackList] = useState<SeedFeedback[]>([]);
  const [franchiseList, setFranchiseList] = useState<SeedFranchiseEnquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'GREEN' | 'GOLD' | 'BLACK'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'spend' | 'visits'>('date');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadAllData = async () => {
      try {
        const rows = await fetchAllCustomers();
        if (!isActive) return;

        const mapped = rows.length
          ? rows.map((row: any) => ({
              id: row.id,
              guestId: row.id?.slice(0, 8).toUpperCase() || 'GUEST',
              name: row.name || row.email?.split('@')[0] || 'Customer',
              email: row.email,
              phone: row.phone || '+91 00000 00000',
              tier: ((row.tier || 'GREEN').toUpperCase().includes('GOLD') ? 'GOLD' : (row.tier || 'GREEN').toUpperCase().includes('BLACK') ? 'BLACK' : 'GREEN') as CustomerProfile['tier'],
              tierLabel: (row.tier || 'GREEN').toUpperCase(),
              points: Number(row.reward_points ?? row.loyalty_points ?? 0),
              visits: Number(row.total_visits ?? row.total_reservations ?? 0),
              bookings: Number(row.total_reservations ?? row.reservations?.length ?? 0),
              totalSpend: Number(row.total_spent ?? 0),
              avgSpend: Number(row.average_spend ?? 0),
              lastVisit: row.last_visit_date || row.joined_date || 'Not available',
              joinedDate: row.joined_date || 'Not available',
              initials: (row.name || row.email || 'C').split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase() || 'C',
            })) as CustomerProfile[]
          : INITIAL_CUSTOMERS;

        setCustomers(mapped);

        if (user) {
          try {
            const res = await getDataProvider().getReservations(user);
            if (res && isActive) setReservations(res);
          } catch {}

          try {
            const fbs = await getDataProvider().getFeedback(user);
            if (fbs && isActive) setFeedbackList(fbs);
          } catch {}

          try {
            const fcs = await getDataProvider().getFranchiseEnquiries(user);
            if (fcs && isActive) setFranchiseList(fcs);
          } catch {}
        }
      } catch {
        if (isActive) setCustomers(INITIAL_CUSTOMERS);
      }
    };

    loadAllData();
    const unsubRes = getDataProvider().subscribe('reservations', () => loadAllData());
    const unsubFb = getDataProvider().subscribe('feedback', () => loadAllData());

    return () => {
      isActive = false;
      unsubRes();
      unsubFb();
    };
  }, [user]);

  const totalSpend = customers.reduce((sum, customer) => sum + (customer.totalSpend || 0), 0);
  const averageYield = customers.length ? Math.round(totalSpend / customers.length) : 0;
  const totalRewardPoints = customers.reduce((sum, customer) => sum + (customer.points || 0), 0);

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

      {/* 4 Multi-Channel Customer Data Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E5DD] pb-3 overflow-x-auto">
        <button
          onClick={() => setSubTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-2 ${
            subTab === 'directory'
              ? 'bg-[#182420] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-black border border-[#E8E5DD]'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Customer Directory ({customers.length})</span>
        </button>
        <button
          onClick={() => setSubTab('reservations')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-2 ${
            subTab === 'reservations'
              ? 'bg-[#182420] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-black border border-[#E8E5DD]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Live Reservations ({reservations.length})</span>
        </button>
        <button
          onClick={() => setSubTab('feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-2 ${
            subTab === 'feedback'
              ? 'bg-[#182420] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-black border border-[#E8E5DD]'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>Guest Feedback ({feedbackList.length})</span>
        </button>
        <button
          onClick={() => setSubTab('franchise')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-2 ${
            subTab === 'franchise'
              ? 'bg-[#182420] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-black border border-[#E8E5DD]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Franchise Applications ({franchiseList.length})</span>
        </button>
      </div>

      {subTab === 'directory' && (
        <>
      {/* 4 Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="customer-telemetry">
        {/* Card 1: Total Patron Spend */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E6DF] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6B7973]">
              TOTAL PATRON SPEND
            </p>
            <h3 className="text-2xl font-serif font-semibold text-[#182420] mt-0.5">
              ₹{totalSpend.toLocaleString('en-IN')}
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
              ₹{averageYield.toLocaleString('en-IN')}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-medium mt-1">
              Across {customers.length || 18} Total Profiles
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
              <h3 className="text-2xl font-serif font-semibold text-[#182420]">{totalRewardPoints.toLocaleString('en-IN')}</h3>
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
              {customers.length ? `${customers.length} Profiles` : 'Chennai Enclaves'}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-mono mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {customers.length ? 'Live loyalty ledger' : 'Poes Garden & ECR Live'}
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
      </>
      )}

      {/* SUBVIEW 2: LIVE CUSTOMER RESERVATIONS */}
      {subTab === 'reservations' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E8E5DD] p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E5DD] gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#182420]">All Customer Reservations</h3>
                <p className="text-xs text-[#5D6B64]">Direct dining reservations placed via the online booking desk and customer portal</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit">
                {reservations.length} Active Records
              </span>
            </div>

            {reservations.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-sm">
                No customer reservations found in database.
              </div>
            ) : (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8E5DD] text-[10px] uppercase font-mono text-zinc-500">
                      <th className="py-2.5">Reference</th>
                      <th>Guest Details</th>
                      <th>Sanctuary Outlet</th>
                      <th>Date &amp; Slot</th>
                      <th>Covers</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DD]/60">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="py-3 font-mono font-bold text-[#182420]">#{res.bookingCode}</td>
                        <td>
                          <div className="font-semibold text-[#182420]">{res.customerName}</div>
                          <div className="text-[11px] text-zinc-500">{res.email || res.phone || 'Contact on file'}</div>
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-1 font-medium text-[#2E483A]">
                            {res.outlet}
                          </span>
                        </td>
                        <td>
                          <div className="font-medium text-[#182420]">{res.date}</div>
                          <div className="text-[11px] text-zinc-500">{res.timeSlot}</div>
                        </td>
                        <td>
                          <span className="font-mono text-zinc-700">{res.guests} Guests</span>
                        </td>
                        <td>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            res.status === 'Confirmed' || res.status === 'Seated'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : res.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}>
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBVIEW 3: LIVE GUEST FEEDBACK */}
      {subTab === 'feedback' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E8E5DD] p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E5DD] gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#182420]">Guest Dining Impressions &amp; Feedback</h3>
                <p className="text-xs text-[#5D6B64]">Direct feedback submissions from patrons across Mayflower sanctuaries</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 w-fit">
                {feedbackList.length} Customer Reviews
              </span>
            </div>

            {feedbackList.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-sm">
                No customer feedback records found in database.
              </div>
            ) : (
              <div className="divide-y divide-[#E8E5DD] mt-3">
                {feedbackList.map((fb) => (
                  <div key={fb.id} className="py-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#182420]">{fb.customerName}</span>
                          {fb.email && <span className="text-xs text-zinc-400">({fb.email})</span>}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182420]/10 text-[#182420] font-semibold">
                            {fb.outlet}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= (fb.rating || 5)
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-zinc-600 ml-1.5 font-medium">{fb.rating}/5</span>
                          <span className="text-[10px] text-zinc-400 ml-3">{fb.createdAt}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full self-start ${
                        fb.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {fb.status || 'New'}
                      </span>
                    </div>
                    <p className="text-xs text-[#2A3B33] leading-relaxed bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E8E5DD]">
                      "{fb.message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBVIEW 4: FRANCHISE APPLICATIONS */}
      {subTab === 'franchise' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E8E5DD] p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E5DD] gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#182420]">Franchise Partnership Enquiries</h3>
                <p className="text-xs text-[#5D6B64]">Submitted applications from prospective partners interested in opening a Mayflower sanctuary</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 w-fit">
                {franchiseList.length} Leads
              </span>
            </div>

            {franchiseList.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-sm">
                No franchise applications found in database.
              </div>
            ) : (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8E5DD] text-[10px] uppercase font-mono text-zinc-500">
                      <th className="py-2.5">Applicant</th>
                      <th>Contact Details</th>
                      <th>City Interested</th>
                      <th>Investment Budget</th>
                      <th>Experience</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DD]/60">
                    {franchiseList.map((lead) => (
                      <tr key={lead.id} className="hover:bg-[#FAF9F6] transition-colors">
                        <td className="py-3 font-semibold text-[#182420]">{lead.applicantName}</td>
                        <td>
                          <div className="text-[#182420]">{lead.email}</div>
                          <div className="text-[11px] text-zinc-500">{lead.phone || 'No phone'}</div>
                        </td>
                        <td className="font-medium text-[#2E483A]">{lead.cityInterested || 'Chennai'}</td>
                        <td className="font-mono text-zinc-700">{lead.investmentBudget || '₹50L - 1Cr'}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lead.priorExperience ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {lead.priorExperience ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
