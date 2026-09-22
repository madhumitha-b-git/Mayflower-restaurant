import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { useSafeNavigate, useSafeLocation } from '../../routes/roleRoutes';
import { getDataProvider } from '../../data/DataProvider';
import { SeedFeedback } from '../../data/mockSeed';
import { SOPChecklistManagement } from './shared/SOPChecklistManagement';
import { OutletManagement } from './shared/OutletManagement';
import {
  X, MapPin, RefreshCw, UserPlus, ChevronDown,
  Clock, Users, Utensils, AlertTriangle, CheckCircle2,
  Circle, Flame, Wine, Flower2, Star
} from 'lucide-react';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (rolePath: string) => void;
}

interface ReservationItem {
  id: string;
  ref: string;
  guestName: string;
  badge?: string;
  badgeColor?: string;
  guests: number;
  time: string;
  area: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
  statusLabel: string;
  table?: string;
  pref?: string;
  tags?: string[];
  courseInfo?: string;
  note?: string;
}

const MOCK_RESERVATIONS: ReservationItem[] = [
  {
    id: 'res-1', ref: '#MF-7729', guestName: 'Dr. Kalanithi Maran',
    badge: 'VIP Patron', badgeColor: 'bg-amber-100 text-amber-800',
    guests: 4, time: 'Today, 1:15 PM', area: 'Poes Conservatory Bay',
    status: 'pending', statusLabel: 'Pending Approval',
    table: 'Unassigned', pref: 'Prefers Quiet Alcove',
    tags: ['No Shellfish', 'Vintage Champagne Pairing', 'Anniversary Protocol'],
  },
  {
    id: 'res-2', ref: '#MF-8812', guestName: 'Ananya & Vikram Sundaram',
    badge: 'Anniversary Dinner', badgeColor: 'bg-rose-100 text-rose-800',
    guests: 2, time: 'Today, 2:00 PM', area: 'Palavakkam Seaside Deck',
    status: 'confirmed', statusLabel: 'Table Assigned',
    table: 'Table S2', pref: 'Sunset Terrace Bay',
    tags: ['Table S2 Reserved', 'Complimentary Champagne Flutes'],
  },
  {
    id: 'res-3', ref: '#MF-9104', guestName: 'Chef Sanjay Narayanan & Party',
    badge: 'Culinary Industry Guest', badgeColor: 'bg-emerald-100 text-emerald-800',
    guests: 6, time: 'Today, 12:45 PM', area: 'Anna Nagar Glass Pavilion',
    status: 'seated', statusLabel: 'Seated & Dining',
    table: 'Table P1', pref: 'Full 7-Course Dim Sum Pairing',
    tags: ['Course 3 Served', 'Wine Pairing Active'],
  },
  {
    id: 'res-4', ref: '#MF-6641', guestName: 'Meera Krishnan (High Tea)',
    badge: 'High Tea Experience', badgeColor: 'bg-purple-100 text-purple-800',
    guests: 3, time: 'Today, 3:30 PM', area: 'Egmore Verandah Suite',
    status: 'pending', statusLabel: 'Awaiting Table Allotment',
    table: 'Unassigned', pref: 'Afternoon Tiered Presentation',
    tags: ['Vegetarian Dim Sum Tier', 'Rare Jasmine Pearls Tea'],
  },
];

const STATUS_STYLES: Record<ReservationItem['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  seated: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-stone-100 text-stone-600',
  cancelled: 'bg-rose-100 text-rose-700',
};

type QueueTab = 'all' | 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'evidence' | 'outlets' | 'feedback';

export const ManagerDashboard: React.FC<Props> = ({ user, onLogout: _onLogout, onSwitchRole }) => {
  const navigate = useSafeNavigate();
  const location = useSafeLocation();

  const [selectedSanctuary, setSelectedSanctuary] = useState('poes');
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>('all');
  const [reservations, setReservations] = useState<ReservationItem[]>(MOCK_RESERVATIONS);
  const [feedbackList, setFeedbackList] = useState<SeedFeedback[]>([]);
  const [inspectTable, setInspectTable] = useState<string | null>(null);
  const [isWalkinOpen, setIsWalkinOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinSize, setWalkinSize] = useState('2 Guests');
  const [walkinZone, setWalkinZone] = useState('The Conservatory (Table C3)');
  const [walkinNotes, setWalkinNotes] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Sync route with active views
  useEffect(() => {
    if (location.pathname.includes('/sops') || location.pathname.includes('/evidence')) {
      setActiveQueueTab('evidence');
    } else if (location.pathname.includes('/outlets')) {
      setActiveQueueTab('outlets');
    } else if (location.pathname.includes('/feedback')) {
      setActiveQueueTab('feedback');
    } else if (location.pathname.includes('/tables')) {
      const el = document.getElementById('zone-allocation-map');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.pathname]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const data = await getDataProvider().getReservations(user);
        if (data && data.length > 0) {
          setReservations(data.map((r) => ({
            id: r.id,
            ref: `#${r.bookingCode}`,
            guestName: r.customerName || 'Guest',
            badge: 'Online Booking',
            badgeColor: 'bg-stone-100 text-stone-600',
            guests: r.guests || 2,
            time: `${r.date}, ${r.timeSlot}`,
            area: r.outlet,
            status: r.status.toLowerCase() as any,
            statusLabel: r.status,
            table: r.assignedTable ? `Table ${r.assignedTable}` : 'Unassigned',
            tags: r.specialRequests ? [r.specialRequests] : [],
          })));
        }

        const fbs = await getDataProvider().getFeedback(user);
        if (fbs) {
          setFeedbackList(fbs);
        }
      } catch {}
    };

    fetchLive();
    const unsubRes = getDataProvider().subscribe('reservations', () => fetchLive());
    const unsubFb = getDataProvider().subscribe('feedback', () => fetchLive());
    return () => {
      unsubRes();
      unsubFb();
    };
  }, [user]);

  const handleApprove = async (id: string) => {
    try {
      await getDataProvider().assignTable(user, id, 'C4');
      setReservations(prev => prev.map(r => r.id === id
        ? { ...r, status: 'confirmed', statusLabel: 'Confirmed', table: 'Table C4' } : r));
      showToast('Reservation approved & assigned to Table C4.');
    } catch (e: any) { showToast(e.message); }
  };

  const handleSeat = async (id: string, table: string) => {
    try {
      await getDataProvider().updateReservationStatus(user, id, 'Seated');
      setReservations(prev => prev.map(r => r.id === id
        ? { ...r, status: 'seated', statusLabel: 'Seated · Active' } : r));
      showToast(`Guest seated at ${table}.`);
    } catch (e: any) { showToast(e.message); }
  };

  const handleComplete = async (id: string) => {
    try {
      await getDataProvider().updateReservationStatus(user, id, 'Completed');
      setReservations(prev => prev.map(r => r.id === id
        ? { ...r, status: 'completed', statusLabel: 'Completed' } : r));
      showToast('Service completed. Table flagged for turnover.');
    } catch (e: any) { showToast(e.message); }
  };

  const handleNoShow = async (id: string) => {
    try {
      await getDataProvider().updateReservationStatus(user, id, 'Cancelled');
      setReservations(prev => prev.map(r => r.id === id
        ? { ...r, status: 'cancelled', statusLabel: 'No-Show' } : r));
      showToast('Marked as No-Show. Table released.');
    } catch (e: any) { showToast(e.message); }
  };

  const handleDecline = async (id: string) => {
    try {
      await getDataProvider().updateReservationStatus(user, id, 'Cancelled');
      setReservations(prev => prev.filter(r => r.id !== id));
      showToast('Reservation declined.');
    } catch (e: any) { showToast(e.message); }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => { setIsSyncing(false); showToast('Data synced successfully.'); }, 900);
  };

  const handleWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsWalkinOpen(false);
    showToast(`Walk-in for ${walkinName || 'Guest'} seated. KOT terminal initialized.`);
    setWalkinName(''); setWalkinNotes('');
  };

  const filtered = reservations.filter(r =>
    activeQueueTab === 'all' ? true : r.status === activeQueueTab
  );

  const counts = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    seated: reservations.filter(r => r.status === 'seated').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1A1A1A] font-sans antialiased">

      {/* ── Sub-header strip (sanctuary selector + quick actions) ── */}
      <div className="bg-white border-b border-[#E8E2D5] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500">Sanctuary:</span>
              <select
                value={selectedSanctuary}
                onChange={e => setSelectedSanctuary(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#1E3932] focus:outline-none cursor-pointer"
              >
                <option value="poes">Poes Garden Flagship</option>
                <option value="ecr">Palavakkam (ECR)</option>
                <option value="egmore">Egmore Heritage Manor</option>
                <option value="anna">Anna Nagar</option>
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-medium text-emerald-700">Live Sync · Active</span>
              </div>
              <button
                onClick={handleSync}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F7F5F0] border border-[#E8E2D5] rounded-lg text-[11px] font-semibold text-stone-600 hover:bg-[#EDE9E0] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync
              </button>
              <button
                onClick={() => setIsWalkinOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1E3932] text-white rounded-lg text-[11px] font-semibold hover:bg-[#152d26] transition-colors cursor-pointer"
              >
                <UserPlus className="w-3 h-3" />
                Walk-In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Shift Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold">Live Floor Command</span>
              <span className="text-stone-300 text-xs">·</span>
              <span className="text-xs text-stone-400">Floor Operations · Poes Garden Ground Floor</span>
            </div>
            <h1 className="text-xl font-semibold text-[#1E3932] tracking-tight">Poes Garden Service Deck</h1>
          </div>
          <div className="text-xs text-stone-500">Captain on Duty: <span className="font-semibold text-[#1E3932]">Vignesh Ramanathan</span></div>
        </div>

        {/* ── 4 Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-[#E8E2D5] p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Active Shift</p>
                <p className="text-sm font-semibold text-[#1E3932] mt-0.5">Midday Luncheon</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] flex items-center justify-center">
                <Utensils className="w-4 h-4 text-[#C5A880]" />
              </div>
            </div>
            <p className="text-xs text-stone-600 font-medium">12:00 PM – 3:30 PM</p>
            <p className="text-[11px] text-stone-400 mt-0.5">72m elapsed</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-[#E8E2D5] p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Floor Saturation</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold text-[#1E3932]">18</span>
                  <span className="text-sm text-stone-400">/ 24 Covers</span>
                </div>
              </div>
              <div className="relative w-10 h-10">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E8E2D5" strokeWidth="3.5" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1E3932" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="3.5" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#1E3932]">75%</span>
              </div>
            </div>
            <div className="w-full bg-[#F7F5F0] rounded-full h-1.5">
              <div className="bg-[#1E3932] h-1.5 rounded-full" style={{ width: '75%' }} />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-stone-400">
              <span>Conservatory: 8/10</span><span>Glasshouse: 10/14</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-[#E8E2D5] p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Arrival Waitlist</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold text-[#1E3932]">2</span>
                  <span className="text-sm text-stone-400">Parties</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#C5A880]" />
              </div>
            </div>
            <p className="text-xs text-stone-600 font-medium">Avg dwell: <span className="text-[#1E3932] font-semibold">12 mins</span></p>
            <p className="text-[11px] text-stone-400 mt-0.5">Next release: C2 in ~4 min</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl border border-[#E8E2D5] p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">KDS Pass Velocity</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold text-[#1E3932]">4</span>
                  <span className="text-sm text-stone-400">KOTs Pending</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] flex items-center justify-center">
                <Flame className="w-4 h-4 text-[#C5A880]" />
              </div>
            </div>
            <p className="text-xs text-stone-600 font-medium">Ticket time: <span className="text-[#1E3932] font-semibold">11 min</span></p>
            <p className="text-[11px] text-stone-400 mt-0.5">Executive Chef on Expo</p>
          </div>
        </div>

        {/* ── Main 2-col Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: Reservation Pipeline (8 cols) */}
          <div className="lg:col-span-8 space-y-4">

            {/* Pipeline Header + Tabs */}
            <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-sm p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-[#1E3932]">Reservation Lifecycle Pipeline</h2>
                  <p className="text-xs text-stone-400 mt-0.5">Live reservation queue · Guest concierge review & seating flow</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs text-emerald-600 font-medium">Real-time polling active</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['all','pending','confirmed','seated','completed','cancelled','evidence','outlets','feedback'] as QueueTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveQueueTab(tab);
                      navigate(tab === 'evidence' ? '/manager/sops' : tab === 'outlets' ? '/manager/outlets' : tab === 'feedback' ? '/manager/feedback' : '/manager/reservations');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors cursor-pointer ${
                      activeQueueTab === tab
                        ? 'bg-[#1E3932] text-white shadow-sm'
                        : 'bg-[#F7F5F0] text-stone-500 hover:text-[#1E3932]'
                    }`}
                  >
                    {tab === 'all' && `All (${counts.all})`}
                    {tab === 'pending' && `Pending (${counts.pending})`}
                    {tab === 'confirmed' && `Confirmed (${counts.confirmed})`}
                    {tab === 'seated' && `Seated (${counts.seated})`}
                    {tab === 'completed' && `Completed (${counts.completed})`}
                    {tab === 'cancelled' && `No-Show (${counts.cancelled})`}
                    {tab === 'evidence' && 'Evidence Review'}
                    {tab === 'outlets' && 'Branches & Outlets'}
                    {tab === 'feedback' && `Guest Feedback (${feedbackList.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Outlets View for Manager (View-Only) */}
            {activeQueueTab === 'outlets' && (
              <div className="space-y-4">
                <OutletManagement user={user} />
              </div>
            )}

            {/* Evidence & SOPs Tab — Chef Geo-Tagged Monitor & Shift Lifecycle */}
            {activeQueueTab === 'evidence' && (
              <div className="space-y-4">
                <SOPChecklistManagement user={user} initialTab="executions" />
              </div>
            )}

            {/* Guest Feedback Tab */}
            {activeQueueTab === 'feedback' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-[#E8E2D5] p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1E3932]">Live Guest Dining Feedback</h3>
                      <p className="text-xs text-stone-500">Real-time impressions submitted by patrons across sanitised touchpoints</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {feedbackList.length} Verified Submissions
                    </span>
                  </div>

                  {feedbackList.length === 0 ? (
                    <div className="py-12 text-center text-stone-400 text-sm">
                      No feedback submitted yet for this outlet.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E8E2D5] mt-2">
                      {feedbackList.map((fb) => (
                        <div key={fb.id} className="py-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-[#1E3932]">{fb.customerName}</span>
                                {fb.email && <span className="text-xs text-stone-400">({fb.email})</span>}
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E3932]/10 text-[#1E3932] font-semibold">
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
                                <span className="text-xs text-stone-500 ml-1.5">{fb.rating}/5</span>
                                <span className="text-[10px] text-stone-400 ml-3">{fb.createdAt}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              fb.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              fb.status === 'Reviewed' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                              'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {fb.status || 'New'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-700 leading-relaxed bg-[#FAF9F5] p-3 rounded-lg border border-[#E8E2D5]">
                            "{fb.message}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reservation Cards */}
            {activeQueueTab !== 'evidence' && activeQueueTab !== 'outlets' && activeQueueTab !== 'feedback' && (
              <div className="space-y-3">
                {filtered.length === 0 && (
                  <div className="bg-white rounded-xl border border-[#E8E2D5] p-8 text-center text-stone-400 text-sm">No reservations in this category.</div>
                )}
                {filtered.map(item => (
                  <div key={item.id} className="bg-white rounded-xl border border-[#E8E2D5] shadow-sm p-4 hover:shadow-md transition-shadow">

                    {/* Guest row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1E3932]/10 text-[#1E3932] flex items-center justify-center font-bold text-sm shrink-0">
                          {item.guestName[0]}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-[#1E3932]">{item.guestName}</span>
                            {item.badge && (
                              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status]}`}>{item.statusLabel}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-stone-400">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.guests} Guests</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.area}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-[#1E3932]">{item.table}</p>
                        {item.pref && <p className="text-[11px] text-stone-400 mt-0.5">{item.pref}</p>}
                      </div>
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 bg-[#F7F5F0] rounded-lg px-3 py-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tasting Profile:</span>
                        {item.tags.map((tag, i) => (
                          <span key={i} className="text-[11px] bg-white border border-[#E8E2D5] text-stone-600 px-2 py-0.5 rounded-md">{tag}</span>
                        ))}
                        <span className="ml-auto text-[11px] text-stone-400 italic">{item.ref}</span>
                      </div>
                    )}

                    {/* Course info */}
                    {item.courseInfo && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 bg-[#F7F5F0] rounded-lg px-3 py-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Active Course:</span>
                        <span className="text-xs font-medium text-[#1E3932]">{item.courseInfo}</span>
                        <span className="ml-auto text-[11px] text-[#C5A880] font-semibold">Sommelier Pairing En Route</span>
                      </div>
                    )}

                    {/* Guest note */}
                    {item.note && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Guest Note:</span>
                        <span className="text-xs text-stone-600">{item.note}</span>
                        <span className="ml-auto text-[11px] text-stone-400 italic">{item.ref}</span>
                      </div>
                    )}

                    {/* Action bar */}
                    <div className="mt-3 pt-3 border-t border-[#F0EBE3] flex flex-wrap items-center justify-between gap-2">
                      {item.status === 'pending' && (
                        <>
                          <div className="flex items-center gap-2">
                            <select className="h-8 px-2 bg-[#F7F5F0] border border-[#E8E2D5] text-xs text-[#1E3932] rounded-lg focus:outline-none cursor-pointer">
                              <option>Allocate: Table C4 (Corner, 4p)</option>
                              <option>Allocate: Table C2 (Window, 4p)</option>
                              <option>Allocate: Table G1 (Glasshouse, 6p)</option>
                            </select>
                            <button onClick={() => handleApprove(item.id)} className="h-8 px-3 bg-[#1E3932] text-white text-xs font-semibold rounded-lg hover:bg-[#152d26] transition-colors cursor-pointer">
                              Approve & Assign
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => showToast(`Adjusting booking for ${item.guestName}`)} className="h-8 px-3 bg-[#F7F5F0] border border-[#E8E2D5] text-xs text-stone-600 rounded-lg hover:bg-[#EDE9E0] transition-colors cursor-pointer">Modify</button>
                            <button onClick={() => handleDecline(item.id)} className="h-8 px-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer">Decline</button>
                          </div>
                        </>
                      )}
                      {item.status === 'confirmed' && (
                        <>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleSeat(item.id, item.table || 'Table')} className="h-8 px-3 bg-[#1E3932] text-white text-xs font-semibold rounded-lg hover:bg-[#152d26] transition-colors cursor-pointer">Mark Seated</button>
                            <button onClick={() => showToast('Opening Floor Matrix...')} className="h-8 px-3 bg-[#F7F5F0] border border-[#E8E2D5] text-xs text-stone-600 rounded-lg hover:bg-[#EDE9E0] transition-colors cursor-pointer">Re-Table</button>
                          </div>
                          <button onClick={() => handleNoShow(item.id)} className="h-8 px-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer">No-Show</button>
                        </>
                      )}
                      {item.status === 'seated' && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleComplete(item.id)} className="h-8 px-3 bg-[#F7F5F0] border border-[#E8E2D5] text-xs font-semibold text-[#1E3932] rounded-lg hover:bg-[#EDE9E0] transition-colors cursor-pointer">Close & Bill</button>
                          <button className="h-8 px-3 bg-[#F7F5F0] border border-[#E8E2D5] text-xs text-stone-600 rounded-lg hover:bg-[#EDE9E0] transition-colors cursor-pointer">Add Course Note</button>
                          <span className="ml-auto text-[11px] text-stone-400">Captain: Vignesh R.</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Side Panels (4 cols) */}
          <div className="lg:col-span-4 space-y-4">

            {/* Shift SOP Progress */}
            <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#1E3932]">Shift SOP Progress</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F7F5F0] border border-[#E8E2D5] text-stone-500 px-2 py-0.5 rounded-md">Lunch Audit</span>
              </div>
              <div className="space-y-2">
                {[
                  { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, label: 'Morning Mise-en-place', sub: 'Verified by Executive Chef', pct: '100%', color: 'text-emerald-600' },
                  { icon: <Circle className="w-4 h-4 text-amber-500" />, label: 'Bar & Cellar Pre-flight', sub: 'Tonic & botanical syrups restock', pct: '88%', color: 'text-amber-600' },
                  { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, label: 'Conservatory Climate & Lux', sub: 'HVAC calibrated to 22.5°C, 65% RH', pct: '100%', color: 'text-emerald-600' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 bg-[#F7F5F0] rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">{item.icon}</div>
                      <div>
                        <p className="text-xs font-semibold text-[#1E3932]">{item.label}</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold shrink-0 ${item.color}`}>{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Floor Escalations */}
            <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#1E3932]">Live Floor Escalations</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                {[
                  { icon: <Flower2 className="w-4 h-4 text-pink-400" />, title: 'Floral Setup Done', time: '6m ago', desc: 'Anniversary tuberoses placed on Table C4 for Dr. Maran.' },
                  { icon: <Wine className="w-4 h-4 text-[#1E3932]" />, title: 'Sommelier Flight', time: '14m ago', desc: 'Table G3 requested premier cru pairing consult.' },
                  { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, title: 'Wagyu Tenderloin 86 Alert', time: '22m ago', desc: 'Executive Chef flagged only 3 portions remaining for lunch.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[#F7F5F0] rounded-lg p-3">
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#E8E2D5] flex items-center justify-center shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#1E3932] truncate">{item.title}</span>
                        <span className="text-[11px] text-stone-400 shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone Allocation Map */}
            <div id="zone-allocation-map" className="bg-white rounded-xl border border-[#E8E2D5] shadow-sm p-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-[#1E3932]">Zone Allocation Map</h2>
                <span className="text-[11px] text-[#C5A880] font-medium">Click to inspect</span>
              </div>
              <p className="text-[11px] text-stone-400 mb-4">Poes Garden Sanctuary</p>

              <div className="space-y-4">
                {/* Conservatory */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3932]">The Conservatory</span>
                    <span className="text-[11px] text-stone-400">4 Tables · 80% Full</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'C1', cap: '2p', state: 'occ', info: 'C1: Occupied by Meera Chandran (2p) · 12:45 PM' },
                      { id: 'C2', cap: '4p', state: 'bill', info: 'C2: Closing check (4p) · 12:00 PM' },
                      { id: 'C3', cap: '2p', state: 'free', info: 'C3: Reserved for 2:15 PM (2p)' },
                      { id: 'C4', cap: '4p', state: 'hold', info: 'C4: Allocated — Dr. Maran (4p) · 1:15 PM' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setInspectTable(inspectTable === t.info ? null : t.info)}
                        className={`p-2 rounded-lg text-center transition-all hover:scale-105 cursor-pointer border ${
                          t.state === 'occ'  ? 'bg-[#1E3932]/10 border-[#1E3932]/20 text-[#1E3932]' :
                          t.state === 'bill' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                          t.state === 'free' ? 'bg-[#F7F5F0] border-[#E8E2D5] text-stone-500' :
                          'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        <div className="text-xs font-bold">{t.id}</div>
                        <div className="text-[10px] mt-0.5 opacity-75">
                          {t.cap} · {t.state === 'occ' ? 'Occ' : t.state === 'bill' ? 'Bill' : t.state === 'free' ? 'Free' : 'Hold'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glasshouse */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3932]">The Glasshouse Bay</span>
                    <span className="text-[11px] text-stone-400">3 Tables · 66% Full</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'G1', cap: '6p', state: 'free', info: 'G1: Available for VIP allocation' },
                      { id: 'G2', cap: '4p', state: 'occ', info: 'G2: Occupied (4p) · 12:30 PM' },
                      { id: 'G3', cap: '6p', state: 'occ', info: 'G3: Sundaram Estate (6p) · 12:28 PM' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setInspectTable(inspectTable === t.info ? null : t.info)}
                        className={`p-2 rounded-lg text-center transition-all hover:scale-105 cursor-pointer border ${
                          t.state === 'occ' ? 'bg-[#1E3932]/10 border-[#1E3932]/20 text-[#1E3932]' : 'bg-[#F7F5F0] border-[#E8E2D5] text-stone-500'
                        }`}
                      >
                        <div className="text-xs font-bold">{t.id}</div>
                        <div className="text-[10px] mt-0.5 opacity-75">{t.cap} · {t.state === 'occ' ? 'Occ' : 'Free'}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inspect banner */}
                {inspectTable && (
                  <div className="flex items-center justify-between bg-[#F7F5F0] border border-[#E8E2D5] rounded-lg px-3 py-2">
                    <span className="text-xs text-[#1E3932] font-medium">{inspectTable}</span>
                    <button onClick={() => setInspectTable(null)} className="text-stone-400 hover:text-stone-600 cursor-pointer ml-2 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Atmosphere Card */}
            <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-sm overflow-hidden">
              <div className="relative h-36">
                <img
                  src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80"
                  alt="Poes Garden Flagship"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E3932]/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-sm font-semibold text-white">Poes Garden Flagship</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-stone-400">
                <span>Air: 22.4°C</span>
                <span>Acoustic: 52 dB</span>
                <span>Status: Online</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Walk-In Modal ── */}
      {isWalkinOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#E8E2D5]">
            <div className="flex items-center justify-between p-5 border-b border-[#E8E2D5]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">Rapid Seating</p>
                <h3 className="text-base font-semibold text-[#1E3932] mt-0.5">Immediate Table Allocation</h3>
              </div>
              <button onClick={() => setIsWalkinOpen(false)} className="w-8 h-8 rounded-full bg-[#F7F5F0] flex items-center justify-center text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleWalkin} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Guest / Host Full Name</label>
                <input
                  type="text" required value={walkinName} onChange={e => setWalkinName(e.target.value)}
                  placeholder="e.g. Vikramaditya Reddy"
                  className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#E8E2D5] rounded-lg text-sm text-[#1E3932] focus:outline-none focus:border-[#1E3932]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Party Size</label>
                  <select value={walkinSize} onChange={e => setWalkinSize(e.target.value)} className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#E8E2D5] rounded-lg text-sm text-[#1E3932] focus:outline-none cursor-pointer">
                    <option>2 Guests</option><option>3 Guests</option><option>4 Guests</option><option>6 Guests</option><option>8+ Private Room</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Zone</label>
                  <select value={walkinZone} onChange={e => setWalkinZone(e.target.value)} className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#E8E2D5] rounded-lg text-sm text-[#1E3932] focus:outline-none cursor-pointer">
                    <option>The Conservatory (Table C3)</option>
                    <option>The Glasshouse Bay (Table G1)</option>
                    <option>Verandah Garden (Table V4)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Notes & Allergens</label>
                <input
                  type="text" value={walkinNotes} onChange={e => setWalkinNotes(e.target.value)}
                  placeholder="e.g. Gluten sensitive, prefers quiet corner"
                  className="w-full h-10 px-3 bg-[#F7F5F0] border border-[#E8E2D5] rounded-lg text-sm text-[#1E3932] focus:outline-none focus:border-[#1E3932]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button type="button" onClick={() => setIsWalkinOpen(false)} className="h-10 px-4 bg-[#F7F5F0] border border-[#E8E2D5] text-sm text-stone-600 rounded-lg hover:bg-[#EDE9E0] transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#1E3932] text-white text-sm font-semibold rounded-lg hover:bg-[#152d26] transition-colors cursor-pointer">Seat Guest</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#1E3932] text-white px-4 py-3 rounded-xl shadow-xl border border-[#C5A880]/30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
          <span className="text-xs font-medium">{toast}</span>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-[#E8E2D5] bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#1E3932]">Mayflower Sanctuaries</p>
              <p className="text-xs text-stone-400 mt-0.5">Haute Gastronomy · Chennai Flagships</p>
            </div>
            {onSwitchRole && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Switch Role:</span>
                {[
                  { label: 'Owner', path: 'owner-management' },
                  { label: 'Admin', path: 'admin-suite' },
                  { label: 'Chef', path: 'chef-kitchen' },
                  { label: 'HR', path: 'hr-roster' },
                  { label: 'Accountant', path: 'accountant-ledger' },
                ].map(r => (
                  <button key={r.path} onClick={() => onSwitchRole(r.path)} className="px-2.5 py-1 bg-[#F7F5F0] border border-[#E8E2D5] text-xs text-stone-600 rounded-lg hover:bg-[#EDE9E0] transition-colors cursor-pointer">
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-stone-400 mt-4 text-center sm:text-left">
            © {new Date().getFullYear()} Mayflower Hospitality Group India LLP. All Privileges Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};
