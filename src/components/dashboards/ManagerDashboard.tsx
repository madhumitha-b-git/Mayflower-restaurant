import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { useTasks } from '../../hooks/useAppData';
import { getDataProvider } from '../../data/DataProvider';
import {
  Check, X, MapPin, RefreshCw, UserPlus, ChevronDown,
  Clock, Users, Utensils, AlertTriangle, CheckCircle2,
  Circle, Flame, Wine, Flower2, ExternalLink,
  ShieldCheck, XCircle, ChefHat
} from 'lucide-react';

// ── Mock chef geo-tagged evidence for demonstration ──────────────────────────
const MOCK_GEO_EVIDENCE = [
  {
    id: 'geo-1',
    chefName: 'Executive Chef',
    taskTitle: 'Walk-in Cooler Temp Log (Target < 3.5°C)',
    taskCategory: 'HACCP',
    capturedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    geoLat: 13.0359,
    geoLng: 80.2473,
    geoAccuracy: 8,
    storagePath: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80',
    remarks: 'Temp checked at 3.2°C — within safe range',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
  },
  {
    id: 'geo-2',
    chefName: 'Sous Chef Vikram',
    taskTitle: 'Line Sanitizer Bucket PPM Check',
    taskCategory: 'Sanitation',
    capturedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    geoLat: 13.0358,
    geoLng: 80.2474,
    geoAccuracy: 12,
    storagePath: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80',
    remarks: 'PPM at 200 — sanitizer renewed at 11:30 AM',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
  },
  {
    id: 'geo-3',
    chefName: 'Pastry Chef Meenakshi',
    taskTitle: 'Waste Disposal & Bin Sanitization',
    taskCategory: 'Sanitation',
    capturedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    geoLat: 13.036,
    geoLng: 80.2471,
    geoAccuracy: 5,
    storagePath: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80',
    remarks: '',
    status: 'approved' as 'pending' | 'approved' | 'rejected',
  },
];

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
    id: 'res-2', ref: '#MF-8103', guestName: 'Ananya & Siddharth Rao',
    badge: 'Online Booking', badgeColor: 'bg-stone-100 text-stone-600',
    guests: 2, time: 'Today, 1:30 PM', area: 'Verandah Garden',
    status: 'confirmed', statusLabel: 'Confirmed',
    table: 'Table V2', pref: 'Locked by Captain Vignesh',
    tags: ['Vegetarian Degustation', 'No Alliums (Jain)'],
  },
  {
    id: 'res-3', ref: '#MF-6691', guestName: 'Sundaram Estate Group',
    badge: 'Corporate Host', badgeColor: 'bg-emerald-100 text-emerald-800',
    guests: 6, time: 'Seated 12:28 PM (44m)', area: 'Table G3 — Glasshouse',
    status: 'seated', statusLabel: 'Seated · Active',
    table: 'Course 3 of 7', pref: 'KOT #4029',
    courseInfo: 'Pan-seared Bay of Bengal Black Bass, Curry Leaf Emulsion',
  },
  {
    id: 'res-4', ref: '#MF-8114', guestName: 'Meera Chandran',
    badge: 'Club 100', badgeColor: 'bg-violet-100 text-violet-800',
    guests: 2, time: 'Today, 2:00 PM', area: 'Conservatory Window',
    status: 'confirmed', statusLabel: 'Confirmed',
    table: 'Table C1', pref: 'Bespoke Floral Placed',
    note: 'Birthday celebration; prefers chilled sparkling water on arrival',
  },
];

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-800 border border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  seated:    'bg-[#1E3932]/10 text-[#1E3932] border border-[#1E3932]/20',
  completed: 'bg-stone-100 text-stone-600 border border-stone-200',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
};

type QueueTab = 'all' | 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'evidence';

// ── Geo Evidence Card Component ───────────────────────────────────────────────
interface GeoEvidenceCardProps {
  evidence: {
    id: string;
    chefName: string;
    taskTitle: string;
    taskCategory: string;
    capturedAt: string;
    geoLat: number;
    geoLng: number;
    geoAccuracy: number;
    storagePath: string;
    remarks: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  onApprove: () => void;
  onReject: () => void;
}

const GeoEvidenceCard: React.FC<GeoEvidenceCardProps> = ({ evidence, onApprove, onReject }) => {
  const [localStatus, setLocalStatus] = React.useState(evidence.status);
  const capturedDate = new Date(evidence.capturedAt);
  const minutesAgo = Math.round((Date.now() - capturedDate.getTime()) / 60000);

  const handleApprove = () => { setLocalStatus('approved'); onApprove(); };
  const handleReject  = () => { setLocalStatus('rejected'); onReject(); };

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
      localStatus === 'approved' ? 'border-emerald-200' :
      localStatus === 'rejected' ? 'border-rose-200 opacity-70' :
      'border-[#E8E2D5]'
    }`}>
      <div className="flex flex-col md:flex-row">
        {/* Photo */}
        <div className="md:w-48 h-48 md:h-auto shrink-0 relative overflow-hidden">
          <img src={evidence.storagePath} alt="Chef geo evidence" className="w-full h-full object-cover" />
          {/* Geo badge overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-mono text-emerald-300 truncate">
                {evidence.geoLat.toFixed(4)}, {evidence.geoLng.toFixed(4)}
              </span>
            </div>
          </div>
          {localStatus !== 'pending' && (
            <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
              localStatus === 'approved' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              {localStatus === 'approved' ? <ShieldCheck className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {localStatus === 'approved' ? 'Approved' : 'Rejected'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col justify-between gap-3">
          <div>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    evidence.taskCategory === 'HACCP' ? 'bg-red-50 text-red-700 border-red-200' :
                    evidence.taskCategory === 'Sanitation' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>{evidence.taskCategory}</span>
                  <span className="text-[11px] text-stone-400">{minutesAgo}m ago</span>
                </div>
                <h3 className="text-sm font-semibold text-[#1E3932]">{evidence.taskTitle}</h3>
              </div>
            </div>

            {/* Chef + Timestamp */}
            <div className="flex flex-wrap gap-4 text-[11px] text-stone-500 mb-2">
              <div className="flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-[#745b20]" />
                <span className="font-semibold text-stone-600">{evidence.chefName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{capturedDate.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Geo Coordinates — Clickable */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">GPS Location Verified</p>
                <a
                  href={`https://maps.google.com/?q=${evidence.geoLat},${evidence.geoLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 group cursor-pointer"
                >
                  {evidence.geoLat.toFixed(6)}, {evidence.geoLng.toFixed(6)}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium shrink-0">±{evidence.geoAccuracy}m</span>
            </div>

            {evidence.remarks && (
              <p className="mt-2 text-[12px] text-stone-500 italic">"{evidence.remarks}"</p>
            )}
          </div>

          {/* Actions */}
          {localStatus === 'pending' ? (
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-[#1E3932] text-white text-xs font-semibold rounded-lg hover:bg-[#152d26] transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Approve Evidence
              </button>
              <button
                onClick={handleReject}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Reject & Escalate
              </button>
            </div>
          ) : (
            <div className={`flex items-center gap-2 text-xs font-semibold py-2 rounded-lg px-3 ${
              localStatus === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {localStatus === 'approved' ? <ShieldCheck className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {localStatus === 'approved' ? 'Evidence Approved — Logged to Compliance Report' : 'Rejected — Chef Notified for Re-submission'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ManagerDashboard: React.FC<Props> = ({ user, onLogout: _onLogout, onSwitchRole }) => {
  const [selectedSanctuary, setSelectedSanctuary] = useState('poes');
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>('all');
  const [reservations, setReservations] = useState<ReservationItem[]>(MOCK_RESERVATIONS);
  const [inspectTable, setInspectTable] = useState<string | null>(null);
  const [isWalkinOpen, setIsWalkinOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinSize, setWalkinSize] = useState('2 Guests');
  const [walkinZone, setWalkinZone] = useState('The Conservatory (Table C3)');
  const [walkinNotes, setWalkinNotes] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [taskEvidence, setTaskEvidence] = useState<Record<string, any[]>>({});

  const { data: kitchenTasks, refetch: refetchTasks } = useTasks(user);

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
      } catch {}
    };
    fetchLive();
  }, [user]);

  useEffect(() => {
    if (activeQueueTab !== 'evidence' || !kitchenTasks) return;
    const load = async () => {
      const provider = getDataProvider();
      const ev: Record<string, any[]> = {};
      for (const task of kitchenTasks) {
        if (task.status === 'Completed' || task.status === 'Escalated') {
          const e = await provider.getTaskEvidence(user, task.id);
          if (e?.length) ev[task.id] = e;
        }
      }
      setTaskEvidence(ev);
    };
    load();
  }, [activeQueueTab, kitchenTasks]);

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

  const handleApproveEvidence = async (taskId: string) => {
    try {
      await getDataProvider().updateTaskStatus(user, taskId, 'Completed', 'Approved by Manager');
      showToast('Evidence approved.');
      refetchTasks();
    } catch (e: any) { showToast(e.message); }
  };

  const handleRejectEvidence = async (taskId: string) => {
    try {
      await getDataProvider().updateTaskStatus(user, taskId, 'Escalated', 'Evidence rejected by Manager');
      showToast('Task escalated for review.');
      refetchTasks();
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
                {(['all','pending','confirmed','seated','completed','cancelled','evidence'] as QueueTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveQueueTab(tab)}
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
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Tab — Chef Geo-Tagged Monitor */}
            {activeQueueTab === 'evidence' && (
              <div className="space-y-4">
                {/* Section Banner */}
                <div className="bg-[#1E3932] text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <ChefHat className="w-4 h-4 text-[#C5A880]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">Chef Evidence Monitor</span>
                    </div>
                    <h3 className="text-sm font-semibold">Geo-Tagged SOP Photo Evidence</h3>
                    <p className="text-[11px] text-stone-300 mt-0.5">Review kitchen SOP compliance with GPS-verified photo proof from your chef team</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-300 font-medium">Live · Auto-refreshing</span>
                  </div>
                </div>

                {/* Live DB evidence (if any) */}
                {kitchenTasks?.filter(t => taskEvidence[t.id]).map(task => (
                  <div key={task.id} className="bg-white rounded-xl border border-[#E8E2D5] shadow-sm p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] bg-[#FAF7F2] border border-[#E8E2D5] px-2 py-0.5 rounded">{task.category}</span>
                          <span className="text-[10px] text-stone-400">from Kitchen SOP database</span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#1E3932]">{task.title}</h3>
                        <div className="flex flex-wrap gap-3 mt-3">
                          {taskEvidence[task.id].map(ev => (
                            <div key={ev.id} className="bg-[#F7F5F0] rounded-xl border border-[#E8E2D5] overflow-hidden">
                              <div className="w-full h-36 overflow-hidden">
                                <img src={ev.storagePath} alt="Evidence" className="w-full h-full object-cover" />
                              </div>
                              <div className="p-3 space-y-1.5">
                                <p className="text-xs font-semibold text-[#1E3932] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  {new Date(ev.capturedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {ev.geoLat && ev.geoLng && (
                                  <a
                                    href={`https://maps.google.com/?q=${ev.geoLat},${ev.geoLng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[11px] text-emerald-700 font-mono hover:text-emerald-900 group cursor-pointer"
                                  >
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    {ev.geoLat.toFixed(4)}, {ev.geoLng.toFixed(4)}
                                    <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-2 shrink-0">
                        <button onClick={() => handleApproveEvidence(task.id)} className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3932] text-white text-xs font-semibold rounded-lg hover:bg-[#152d26] transition-colors cursor-pointer">
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => handleRejectEvidence(task.id)} className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg hover:bg-rose-100 transition-colors cursor-pointer">
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mock geo-evidence cards (always shown for demo) */}
                {MOCK_GEO_EVIDENCE.map(ev => (
                  <GeoEvidenceCard
                    key={ev.id}
                    evidence={ev}
                    onApprove={() => showToast(`Evidence approved: ${ev.taskTitle}`)}
                    onReject={() => showToast(`Evidence rejected & escalated: ${ev.taskTitle}`)}
                  />
                ))}

                {!kitchenTasks?.filter(t => taskEvidence[t.id]).length && MOCK_GEO_EVIDENCE.length === 0 && (
                  <div className="bg-white rounded-xl border border-[#E8E2D5] p-8 text-center text-stone-400 text-sm">No evidence pending review.</div>
                )}
              </div>
            )}

            {/* Reservation Cards */}
            {activeQueueTab !== 'evidence' && (
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
            <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-sm p-4">
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
