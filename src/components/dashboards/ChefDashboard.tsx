import React, { useState, useEffect, useCallback } from 'react';
import {
  Flame, Clock, CheckCircle2, RefreshCw, Printer, ShieldAlert, X,
  Sparkles, Camera, ChefHat, ClipboardList, AlertTriangle,
  Layers, Utensils, Leaf, Star,
  MapPin, Image as ImageIcon, Check, Circle, Timer,
  TrendingUp, Users, Coffee, Package
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getDataProvider } from '../../data/DataProvider';
import { useTasks } from '../../hooks/useAppData';
import { EvidenceUploadModal } from './shared/EvidenceUploadModal';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (rolePath: string) => void;
}

// ── KDS ──────────────────────────────────────────────────────────────────────
interface KDSTicket {
  id: string;
  table: string;
  guests: number;
  server: string;
  type: string;
  timerStartSeconds: number;
  stage: string;
  items: { name: string; desc?: string; badge?: string; badgeColor?: string; note?: string }[];
  pairing?: { title: string; desc: string; status: string };
  nextCourse?: { name: string; status: string };
  isRush?: boolean;
  isVip?: boolean;
  vipTitle?: string;
}

const INITIAL_TICKETS: KDSTicket[] = [
  {
    id: 'ticket-c1', table: 'Table C1', guests: 4, server: 'Karthik',
    type: 'A La Carte', timerStartSeconds: 360, stage: 'Plating Stage',
    items: [
      { name: '2x Smoked Burrata Pugliese', desc: 'Heirloom tomato concassé, cold-pressed basil oil', badge: 'Pass Ready', badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200', note: 'Nut Allergy: Guest 2' },
    ],
    pairing: { title: 'Sommelier Pairing Fired', desc: '2x 2021 Dujac Morey-Saint-Denis Pinot Noir', status: 'Poured' },
  },
  {
    id: 'ticket-c5', table: 'Table C5', guests: 4, server: 'Arvind',
    type: 'Course 3 of 4', timerStartSeconds: 840, stage: 'Over Target (12m)',
    isRush: true,
    items: [
      { name: '3x Braised Nilgiri Lamb Shank', desc: 'Sous-vide 36hr, rosemary jus, roasted shallots', badge: 'Line Firing', badgeColor: 'bg-red-50 text-red-700 border border-red-200', note: 'Temp: Medium-Well for Seat 3' },
      { name: '1x Morel Mushroom Risotto', desc: 'Acquerello carnaroli, 24mo Parmigiano, Ooty morel froth', badge: 'Finishing Mantecare', badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200' },
    ],
  },
  {
    id: 'ticket-g2', table: 'Table G2', guests: 4, server: 'Priya',
    type: '7-Course Degustation', timerStartSeconds: 495, stage: 'Course 5 of 7',
    isVip: true, vipTitle: "Chef's Table VIP",
    items: [
      { name: '2x Smoked Nilgiri Morel Risotto', desc: 'Edible gold leaf & winter black truffle at tableside', badge: 'Pass Ready', badgeColor: 'bg-[#02150c] text-[#C5A880]' },
    ],
    nextCourse: { name: 'Pan-Seared Bay of Bengal Sea Bass, Velouté & Sea Fennel', status: 'Pre-fire command sent to Station A' },
  },
  {
    id: 'ticket-v1', table: 'Table V1', guests: 2, server: 'Deepa',
    type: 'Veranda Booth', timerStartSeconds: 120, stage: 'Fresh Order',
    items: [
      { name: '1x House Sourdough & Whipped Cultured Butter', desc: 'Maldon sea salt, roasted garlic ash infusion', badge: 'Larder Queued', badgeColor: 'bg-gray-100 text-gray-700' },
      { name: '2x Seared Coromandel Sea Bass', desc: 'Lemongrass velouté, pickled samphire, charred leek', badge: 'Pending App', badgeColor: 'bg-gray-100 text-gray-700' },
    ],
  },
];

// ── Prep Items ────────────────────────────────────────────────────────────────
interface PrepItem {
  id: string;
  station: string;
  task: string;
  qty: string;
  status: 'done' | 'in-progress' | 'pending' | 'delayed';
  by: string;
}

const PREP_ITEMS: PrepItem[] = [
  { id: 'p1', station: 'Cold Larder', task: 'Burrata portioning & marination', qty: '24 portions', status: 'done', by: 'Suresh P.' },
  { id: 'p2', station: 'Pastry', task: 'Sourdough proofing (2nd batch)', qty: '3 loaves', status: 'in-progress', by: 'Meenakshi R.' },
  { id: 'p3', station: 'Meat Station', task: 'Lamb shank sous-vide pull & chill', qty: '8 shanks', status: 'done', by: 'Rajan K.' },
  { id: 'p4', station: 'Sauce Kitchen', task: 'Rosemary jus reduction — target 250ml', qty: '3 batches', status: 'in-progress', by: 'Karan M.' },
  { id: 'p5', station: 'Garde Manger', task: 'Heirloom tomato concassé prep', qty: '500g', status: 'pending', by: 'Unassigned' },
  { id: 'p6', station: 'Pan Station', task: 'Sea bass portioning & skin scoring', qty: '16 fillets', status: 'pending', by: 'Suresh P.' },
  { id: 'p7', station: 'Cold Larder', task: 'Whipped cultured butter chill set', qty: '12 ramekins', status: 'done', by: 'Meenakshi R.' },
  { id: 'p8', station: 'Pastry', task: 'Dessert mise-en-place: chocolate marquise', qty: '20 slices', status: 'delayed', by: 'Karan M.' },
];

// ── 86 Board ──────────────────────────────────────────────────────────────────
interface EightySixItem {
  id: string;
  item: string;
  reason: string;
  flaggedAt: string;
  flaggedBy: string;
  status: 'active' | 'resolved';
}

const EIGHTY_SIX_BOARD: EightySixItem[] = [
  { id: '86-1', item: 'Ooty Wild Morel Mushrooms', reason: 'Stock exhausted during lunch service', flaggedAt: '12:42 PM', flaggedBy: 'Executive Chef', status: 'active' },
  { id: '86-2', item: 'Wagyu Beef Tenderloin', reason: 'Only 2 portions remaining — VIP hold', flaggedAt: '11:30 AM', flaggedBy: 'Sous Chef Vikram', status: 'active' },
  { id: '86-3', item: 'Bay of Bengal Mud Crab', reason: 'Delivery not received — supplier issue', flaggedAt: '10:00 AM', flaggedBy: 'Executive Chef', status: 'resolved' },
];

// ── Menu Items ────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { category: 'Starters', items: [
    { name: 'Smoked Burrata Pugliese', allergens: ['Dairy', 'Gluten'], diet: 'V', note: 'Basil oil — nut-free line' },
    { name: 'Nilgiri Lamb Rillettes', allergens: ['Gluten'], diet: '', note: 'Medium-rare default' },
    { name: 'Sea Bass Ceviche', allergens: ['Fish'], diet: '', note: 'Lemongrass marinade 4h prior' },
  ]},
  { category: 'Mains', items: [
    { name: 'Braised Nilgiri Lamb Shank', allergens: ['Dairy'], diet: '', note: 'Sous-vide 36hr; temp on order' },
    { name: 'Morel Mushroom Risotto', allergens: ['Dairy', 'Gluten'], diet: 'V', note: 'Separate pan for Jain (no onion)' },
    { name: 'Pan-Seared Sea Bass', allergens: ['Fish', 'Dairy'], diet: '', note: 'Skin on; fire 4min per side' },
  ]},
  { category: 'Desserts', items: [
    { name: 'Chocolate Marquise', allergens: ['Dairy', 'Eggs'], diet: 'V', note: '87% Valrhona; serve at 6°C' },
    { name: 'Rose Kheer Brulee', allergens: ['Dairy', 'Eggs'], diet: 'V', note: 'Torch crust at pass' },
  ]},
];

// ── SOP category colors ───────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'HACCP':      'text-red-700 bg-red-50 border-red-200',
  'Sanitation': 'text-blue-700 bg-blue-50 border-blue-200',
  'Prep':       'text-amber-700 bg-amber-50 border-amber-200',
  'Quality':    'text-emerald-700 bg-emerald-50 border-emerald-200',
  'Opening':    'text-purple-700 bg-purple-50 border-purple-200',
  'Closing':    'text-slate-700 bg-slate-50 border-slate-200',
};

type ChefTab = 'kds' | 'sops' | 'prep' | 'eightysix' | 'menu' | 'shift';

// ─────────────────────────────────────────────────────────────────────────────
export const ChefDashboard: React.FC<Props> = ({ user, onSwitchRole }) => {
  const [activeTab, setActiveTab] = useState<ChefTab>('kds');
  const [serviceClock, setServiceClock] = useState('');
  const [activeKdsFilter, setActiveKdsFilter] = useState<'all' | 'degustation' | 'alacarte'>('all');
  const [tickets, setTickets] = useState<KDSTicket[]>(INITIAL_TICKETS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 86 Board
  const [isEightySixModalOpen, setIsEightySixModalOpen] = useState(false);
  const [eightySixItem, setEightySixItem] = useState('');
  const [eightySixReason, setEightySixReason] = useState('');
  const [eightySixBoard, setEightySixBoard] = useState<EightySixItem[]>(EIGHTY_SIX_BOARD);

  // SOP Evidence
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
  const [selectedTaskCategory, setSelectedTaskCategory] = useState('');

  // Tasks
  const { data: kitchenTasks, refetch: refetchTasks } = useTasks(user);
  const [localTaskStatus, setLocalTaskStatus] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setServiceClock(new Date().toLocaleTimeString('en-GB') + ' IST');
    }, 1000);
    const timerInterval = setInterval(() => {
      setTickets(prev => prev.map(t => ({ ...t, timerStartSeconds: t.timerStartSeconds + 1 })));
    }, 1000);
    return () => { clearInterval(clockInterval); clearInterval(timerInterval); };
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const handleBumpTicket = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    showToast(`Ticket bumped to Pass — service complete.`);
  };

  const handleToggleTaskStatus = useCallback(async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    setLocalTaskStatus(prev => ({ ...prev, [taskId]: newStatus }));
    try {
      await getDataProvider().updateTaskStatus(user, taskId, newStatus as any);
      showToast(`SOP updated: ${newStatus}`);
      refetchTasks();
    } catch (err: any) {
      setLocalTaskStatus(prev => { const s = { ...prev }; delete s[taskId]; return s; });
      showToast(`Error: ${err.message}`);
    }
  }, [user, refetchTasks]);

  const handleConfirmEightySix = () => {
    const newItem: EightySixItem = {
      id: `86-${Date.now()}`,
      item: eightySixItem || 'Item',
      reason: eightySixReason || 'Out of stock',
      flaggedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      flaggedBy: user.name,
      status: 'active',
    };
    setEightySixBoard(prev => [newItem, ...prev]);
    setIsEightySixModalOpen(false);
    setEightySixItem('');
    setEightySixReason('');
    showToast(`"${newItem.item}" is now 86'd. Kitchen, Bar & Floor notified.`);
  };

  const handleResolve86 = (id: string) => {
    setEightySixBoard(prev => prev.map(i => i.id === id ? { ...i, status: 'resolved' } : i));
    showToast('Item reinstated. Stock restored to the line.');
  };

  const filteredTickets = tickets.filter(t => {
    if (activeKdsFilter === 'degustation') return t.isVip || t.type.includes('Degustation');
    if (activeKdsFilter === 'alacarte') return !t.isVip && !t.type.includes('Degustation');
    return true;
  });

  const sopTasks = kitchenTasks && kitchenTasks.length > 0 ? kitchenTasks : [
    { id: 'sop-1', title: 'Line Sanitizer Bucket PPM Check', category: 'Sanitation', status: 'Pending', dueAt: '11:00 AM', priority: 'High' },
    { id: 'sop-2', title: 'Walk-in Cooler Temp Log (Target < 3.5°C)', category: 'HACCP', status: 'Completed', dueAt: '12:00 PM', priority: 'Critical' },
    { id: 'sop-3', title: 'Protein Thawing & Date Tag Audit', category: 'Prep', status: 'In Progress', dueAt: '02:00 PM', priority: 'Medium' },
    { id: 'sop-4', title: 'Cross-Contamination Surface Swab', category: 'HACCP', status: 'Pending', dueAt: '01:00 PM', priority: 'Critical' },
    { id: 'sop-5', title: 'Cold Display Temp Log (Dessert Station)', category: 'HACCP', status: 'Pending', dueAt: '03:00 PM', priority: 'High' },
    { id: 'sop-6', title: 'Waste Disposal & Bin Sanitization', category: 'Sanitation', status: 'Completed', dueAt: '10:30 AM', priority: 'Medium' },
  ];

  const completedSops = sopTasks.filter(t => (localTaskStatus[t.id] || t.status) === 'Completed').length;
  const sopProgress = sopTasks.length > 0 ? Math.round((completedSops / sopTasks.length) * 100) : 0;

  const prepDone = PREP_ITEMS.filter(p => p.status === 'done').length;
  const active86 = eightySixBoard.filter(i => i.status === 'active').length;

  // ─── Tabs config ────────────────────────────────────────────────────────────
  const TABS: { id: ChefTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'kds',       label: 'Live KDS',       icon: <Flame className="w-3.5 h-3.5" />,        badge: tickets.length > 0 ? String(tickets.length) : undefined },
    { id: 'sops',      label: 'SOPs & Evidence', icon: <ClipboardList className="w-3.5 h-3.5" />, badge: sopProgress < 100 ? `${sopProgress}%` : undefined },
    { id: 'prep',      label: 'Daily Prep',      icon: <Layers className="w-3.5 h-3.5" />,       badge: `${prepDone}/${PREP_ITEMS.length}` },
    { id: 'eightysix', label: '86 Board',        icon: <ShieldAlert className="w-3.5 h-3.5" />,   badge: active86 > 0 ? String(active86) : undefined },
    { id: 'menu',      label: 'Menu & Allergens', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'shift',     label: 'My Shift',        icon: <ChefHat className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1b1c1a] font-sans antialiased pb-10">

      {/* ── Toast ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#02150c] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border border-[#C5A880]/40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#C5A880] shrink-0" />
          <span className="text-xs font-semibold text-[#C5A880]">{toastMessage}</span>
        </div>
      )}

      {/* ── Chef Sub-Header ── */}
      <header className="bg-white border-b border-[#e4e2de] shadow-sm sticky top-11 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#02150c] text-[#C5A880] flex items-center justify-center shadow">
                <ChefHat className="w-4.5 h-4.5" />
              </div>
              <div>
                <h1 className="font-serif text-base font-bold text-[#02150c] leading-tight">Kitchen Command Centre</h1>
                <p className="text-[10px] font-bold text-[#745b20] uppercase tracking-widest">
                  Executive Chef · {user.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Live Clock */}
              <div className="hidden sm:flex items-center gap-1.5 bg-[#f5f3ef] px-3 py-1.5 rounded-xl text-xs">
                <Clock className="w-3.5 h-3.5 text-[#745b20]" />
                <span className="font-mono font-bold text-[#02150c] text-[11px]">{serviceClock}</span>
              </div>

              {/* Stats Pills */}
              <div className="hidden md:flex items-center gap-1.5">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-xl">
                  {tickets.length} KDS Active
                </div>
                {active86 > 0 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold px-2.5 py-1.5 rounded-xl">
                    {active86} Item 86'd
                  </div>
                )}
              </div>

              {/* 86 Quick Action */}
              <button
                onClick={() => setIsEightySixModalOpen(true)}
                className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">86 Item</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <nav className="bg-white border-b border-[#e4e2de] sticky top-[100px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#02150c] text-[#02150c]'
                    : 'border-transparent text-stone-400 hover:text-stone-600 hover:border-stone-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-[#02150c] text-[#C5A880]' : 'bg-[#f5f3ef] text-stone-500'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ════════════ KDS TAB ════════════ */}
        {activeTab === 'kds' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#02150c] text-white p-5 rounded-2xl shadow-md">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-[#C5A880] animate-pulse" />
                  <span className="text-[#C5A880] text-[10px] font-bold uppercase tracking-widest">Live Kitchen Pass</span>
                </div>
                <h2 className="font-serif text-xl font-bold">Active Orders & Course Pace</h2>
                <p className="text-xs text-[#a8b5a0] mt-0.5">{tickets.length} active tickets queued on the line</p>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl">
                {(['all', 'degustation', 'alacarte'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveKdsFilter(f)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                      activeKdsFilter === f ? 'bg-[#C5A880] text-[#02150c]' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {f === 'all' ? `All (${tickets.length})` : f === 'degustation' ? 'Degustation / VIP' : 'À La Carte'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredTickets.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-[#e4e2de] text-sm text-stone-400">
                  No active KDS tickets in queue. Pass is clear!
                </div>
              ) : (
                filteredTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className={`bg-white rounded-2xl border ${ticket.isRush ? 'border-red-300 ring-2 ring-red-100' : 'border-[#e4e2de]'} shadow-sm hover:shadow-md transition flex flex-col overflow-hidden`}
                  >
                    <div className={`p-4 border-b border-[#e4e2de] ${ticket.isVip ? 'bg-[#02150c] text-white' : 'bg-[#faf9f6]'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-sm ${ticket.isVip ? 'text-[#C5A880]' : 'text-[#02150c]'}`}>{ticket.table}</span>
                        <div className={`flex items-center gap-1 font-mono text-xs font-bold ${
                          ticket.timerStartSeconds > 720 ? 'text-red-500' :
                          ticket.timerStartSeconds > 480 ? 'text-amber-600' : 'text-[#745b20]'
                        }`}>
                          <Timer className="w-3.5 h-3.5" />
                          <span>{formatTimer(ticket.timerStartSeconds)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[11px] opacity-80">
                        <span>{ticket.guests}g · {ticket.server}</span>
                        <span className="font-semibold">{ticket.type}</span>
                      </div>
                      {ticket.isRush && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <AlertTriangle className="w-3 h-3" /> RUSH — Over Target
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 space-y-3">
                      {ticket.items.map((item, idx) => (
                        <div key={idx} className="space-y-1 pb-2 border-b border-[#f0ede8] last:border-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-[#02150c] leading-tight">{item.name}</span>
                            {item.badge && (
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${item.badgeColor || 'bg-gray-100'}`}>{item.badge}</span>
                            )}
                          </div>
                          {item.desc && <p className="text-[11px] text-stone-400">{item.desc}</p>}
                          {item.note && (
                            <div className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">⚠ {item.note}</div>
                          )}
                        </div>
                      ))}
                      {ticket.nextCourse && (
                        <div className="bg-[#f5f3ef] border border-[#e4e2de] rounded-xl p-2.5 text-[11px]">
                          <span className="font-bold text-[#745b20] uppercase text-[9px] block mb-0.5">Next Course:</span>
                          <span className="font-semibold text-[#02150c]">{ticket.nextCourse.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-[#faf9f6] border-t border-[#e4e2de] flex gap-2">
                      <button
                        onClick={() => showToast(`Duplicate KOT printed for ${ticket.table}`)}
                        className="p-2 rounded-lg border border-[#e4e2de] bg-white hover:bg-[#f5f3ef] text-stone-500 transition cursor-pointer"
                        title="Print Duplicate KOT"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleBumpTicket(ticket.id)}
                        className="flex-1 bg-[#02150c] text-[#C5A880] text-xs font-bold py-2 rounded-xl hover:bg-[#0a2a18] transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Bump Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* KDS Summary Row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Rush Tickets', value: tickets.filter(t => t.isRush).length, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
                { label: 'VIP / Degustation', value: tickets.filter(t => t.isVip).length, color: 'text-[#745b20]', bg: 'bg-[#fdf8f0]', border: 'border-[#e8d9b0]', icon: <Star className="w-4 h-4 text-[#745b20]" /> },
                { label: 'Pass Clear In', value: '~18 min', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
              ].map((card, i) => (
                <div key={i} className={`${card.bg} border ${card.border} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-1">{card.icon}<span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{card.label}</span></div>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ════════════ SOPs & EVIDENCE TAB ════════════ */}
        {activeTab === 'sops' && (
          <>
            {/* Progress Header */}
            <div className="bg-[#02150c] text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList className="w-4 h-4 text-[#C5A880]" />
                  <span className="text-[#C5A880] text-[10px] font-bold uppercase tracking-widest">HACCP & Kitchen SOPs</span>
                </div>
                <h2 className="font-serif text-xl font-bold">Operations & SOP Checklists</h2>
                <p className="text-xs text-[#a8b5a0] mt-0.5">
                  {completedSops} of {sopTasks.length} tasks completed today · Geo-tagged evidence required
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#C5A880" strokeDasharray={`${sopProgress}, 100`} strokeLinecap="round" strokeWidth="3.5" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#C5A880]">{sopProgress}%</span>
                </div>
                <button
                  onClick={() => refetchTasks()}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#C5A880] bg-white/10 px-3 py-1.5 rounded-xl hover:bg-white/20 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync
                </button>
              </div>
            </div>

            {/* Info Banner — Key Requirement */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">Geo-Tagged Photo Evidence Required</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  For all SOP and Operations tasks, you must capture a photo with GPS location embedded. Evidence is reviewed by your Manager in real-time. Ensure location permission is granted before tapping <strong>Upload Evidence</strong>.
                </p>
              </div>
            </div>

            {/* SOP Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sopTasks.map(task => {
                const status = localTaskStatus[task.id] || task.status;
                const isDone = status === 'Completed';
                const catColor = CATEGORY_COLORS[task.category] || 'text-stone-700 bg-stone-50 border-stone-200';

                return (
                  <div key={task.id} className={`rounded-2xl border bg-white shadow-sm p-5 flex flex-col gap-3 transition hover:shadow-md ${isDone ? 'opacity-80' : ''}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${catColor} mb-1.5`}>
                          {task.category}
                        </span>
                        <h4 className="font-bold text-sm text-[#02150c] leading-tight">{task.title}</h4>
                      </div>
                      {isDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                      {!isDone && status === 'In Progress' && <Circle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[11px] text-stone-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due {task.dueAt}</span>
                      {task.priority && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                          task.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                          task.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-stone-50 text-stone-500 border-stone-200'
                        }`}>{task.priority}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleToggleTaskStatus(task.id, status)}
                        className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer text-center ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-[#02150c] text-[#C5A880] border-[#02150c] hover:bg-[#0a2a18]'
                        }`}
                      >
                        {isDone ? '✓ Completed' : status === 'In Progress' ? '● In Progress' : 'Mark Complete'}
                      </button>

                      {/* Evidence Upload — KEY FEATURE */}
                      <button
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setSelectedTaskTitle(task.title);
                          setSelectedTaskCategory(task.category);
                          setEvidenceModalOpen(true);
                        }}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                          isDone
                            ? 'bg-stone-50 text-stone-400 border-stone-200 cursor-default'
                            : 'bg-white text-[#745b20] border-[#C5A880]/50 hover:bg-[#fdf8f0] hover:border-[#C5A880]'
                        }`}
                        title={isDone ? 'Already submitted' : 'Upload geo-tagged photo evidence'}
                      >
                        {isDone ? <ImageIcon className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                        {isDone ? 'Submitted' : 'Evidence'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ════════════ DAILY PREP TAB ════════════ */}
        {activeTab === 'prep' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#02150c] text-white p-5 rounded-2xl shadow-md">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-[#C5A880]" />
                  <span className="text-[#C5A880] text-[10px] font-bold uppercase tracking-widest">Pre-Service Mise en Place</span>
                </div>
                <h2 className="font-serif text-xl font-bold">Daily Prep Tracker</h2>
                <p className="text-xs text-[#a8b5a0] mt-0.5">{prepDone} of {PREP_ITEMS.length} stations ready for service</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                {[
                  { label: 'Ready', val: PREP_ITEMS.filter(p => p.status === 'done').length, color: 'text-emerald-400' },
                  { label: 'In Progress', val: PREP_ITEMS.filter(p => p.status === 'in-progress').length, color: 'text-amber-400' },
                  { label: 'Pending', val: PREP_ITEMS.filter(p => p.status === 'pending').length, color: 'text-stone-300' },
                  { label: 'Delayed', val: PREP_ITEMS.filter(p => p.status === 'delayed').length, color: 'text-red-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 rounded-xl px-3 py-2">
                    <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-[10px] text-white/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm overflow-hidden">
              <div className="divide-y divide-[#f0ede8]">
                {PREP_ITEMS.map(item => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#faf9f6] transition-colors">
                    {/* Status icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.status === 'done'        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      item.status === 'in-progress' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      item.status === 'delayed'     ? 'bg-red-50 text-red-600 border border-red-200' :
                      'bg-stone-50 text-stone-400 border border-stone-200'
                    }`}>
                      {item.status === 'done' ? <Check className="w-4 h-4" /> :
                       item.status === 'in-progress' ? <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} /> :
                       item.status === 'delayed' ? <AlertTriangle className="w-4 h-4" /> :
                       <Circle className="w-4 h-4" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#745b20]">{item.station}</span>
                        <span className="text-[10px] text-stone-400">·</span>
                        <span className="text-[11px] text-stone-400">{item.by}</span>
                      </div>
                      <p className="text-sm font-semibold text-[#02150c] mt-0.5">{item.task}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-stone-500">{item.qty}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border mt-1 inline-block ${
                        item.status === 'done'        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        item.status === 'in-progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        item.status === 'delayed'     ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-stone-50 text-stone-500 border-stone-200'
                      }`}>
                        {item.status === 'done' ? 'Ready' : item.status === 'in-progress' ? 'In Progress' : item.status === 'delayed' ? 'Delayed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════════════ 86 BOARD TAB ════════════ */}
        {activeTab === 'eightysix' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 bg-red-900 text-white p-5 rounded-2xl shadow-md">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-red-300 animate-pulse" />
                  <span className="text-red-300 text-[10px] font-bold uppercase tracking-widest">Menu Availability Alert</span>
                </div>
                <h2 className="font-serif text-xl font-bold">86 Board — Unavailable Items</h2>
                <p className="text-xs text-red-300 mt-0.5">{active86} item{active86 !== 1 ? 's' : ''} currently unavailable · Floor & Bar notified</p>
              </div>
              <button
                onClick={() => setIsEightySixModalOpen(true)}
                className="flex items-center gap-2 bg-white text-red-800 text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-50 transition cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                Flag New Item
              </button>
            </div>

            <div className="space-y-3">
              {eightySixBoard.map(item => (
                <div key={item.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.status === 'active' ? 'border-red-200' : 'border-[#e4e2de] opacity-60'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.status === 'active' ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-400'
                    }`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          item.status === 'active' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-stone-50 text-stone-500 border-stone-200'
                        }`}>
                          {item.status === 'active' ? '86\'d — Unavailable' : 'Resolved'}
                        </span>
                        <span className="text-[11px] text-stone-400">{item.flaggedAt} · {item.flaggedBy}</span>
                      </div>
                      <h4 className="font-bold text-base text-[#02150c] mt-1">{item.item}</h4>
                      <p className="text-sm text-stone-500 mt-0.5">{item.reason}</p>
                    </div>
                  </div>
                  {item.status === 'active' && (
                    <button
                      onClick={() => handleResolve86(item.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition cursor-pointer shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Reinstate Item
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ════════════ MENU & ALLERGENS TAB ════════════ */}
        {activeTab === 'menu' && (
          <>
            <div className="bg-[#02150c] text-white p-5 rounded-2xl shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <Utensils className="w-4 h-4 text-[#C5A880]" />
                <span className="text-[#C5A880] text-[10px] font-bold uppercase tracking-widest">Kitchen Reference</span>
              </div>
              <h2 className="font-serif text-xl font-bold">Menu & Allergen Reference</h2>
              <p className="text-xs text-[#a8b5a0] mt-0.5">Read-only · For station preparation and allergen awareness</p>
            </div>

            {/* Allergen Legend */}
            <div className="flex flex-wrap gap-2">
              {[
                { a: 'Dairy', icon: '🥛' }, { a: 'Gluten', icon: '🌾' },
                { a: 'Fish', icon: '🐟' }, { a: 'Nuts', icon: '🥜' },
                { a: 'Eggs', icon: '🥚' }, { a: 'V', icon: '🌿', label: 'Vegetarian' },
              ].map(tag => (
                <div key={tag.a} className="flex items-center gap-1.5 bg-white border border-[#e4e2de] text-xs text-stone-600 px-3 py-1.5 rounded-xl">
                  <span>{tag.icon}</span>
                  <span className="font-medium">{tag.label || tag.a}</span>
                </div>
              ))}
            </div>

            {MENU_ITEMS.map(cat => (
              <div key={cat.category} className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-[#faf9f6] border-b border-[#e4e2de]">
                  <h3 className="font-serif text-base font-bold text-[#02150c]">{cat.category}</h3>
                </div>
                <div className="divide-y divide-[#f0ede8]">
                  {cat.items.map((item, i) => (
                    <div key={i} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.diet === 'V' && <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          <span className="font-semibold text-sm text-[#02150c]">{item.name}</span>
                        </div>
                        {item.note && <p className="text-[11px] text-stone-400 mt-0.5 ml-5">{item.note}</p>}
                      </div>
                      <div className="flex flex-wrap gap-1.5 shrink-0">
                        {item.allergens.map(a => (
                          <span key={a} className="text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded">
                            ⚠ {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ════════════ MY SHIFT TAB ════════════ */}
        {activeTab === 'shift' && (
          <>
            <div className="bg-[#02150c] text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ChefHat className="w-4 h-4 text-[#C5A880]" />
                  <span className="text-[#C5A880] text-[10px] font-bold uppercase tracking-widest">Shift Overview</span>
                </div>
                <h2 className="font-serif text-xl font-bold">My Shift — {user.name}</h2>
                <p className="text-xs text-[#a8b5a0] mt-0.5">Poes Garden Flagship · Lunch & Dinner Service</p>
              </div>
              <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl px-4 py-2 text-center">
                <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Shift Status</p>
                <p className="text-white font-bold text-base">● Active</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Shift Info Card */}
              <div className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-5 space-y-4">
                <h3 className="font-serif text-base font-bold text-[#02150c]">Shift Details</h3>
                {[
                  { icon: <Clock className="w-4 h-4 text-[#745b20]" />, label: 'Shift Hours', value: '11:00 AM – 11:00 PM' },
                  { icon: <Utensils className="w-4 h-4 text-[#745b20]" />, label: 'Station', value: 'Hot Kitchen — Exec. Chef Position' },
                  { icon: <Users className="w-4 h-4 text-[#745b20]" />, label: 'Brigade Size', value: '8 Staff on Line' },
                  { icon: <Coffee className="w-4 h-4 text-[#745b20]" />, label: 'Break Slot', value: '3:00 PM – 3:30 PM' },
                  { icon: <Package className="w-4 h-4 text-[#745b20]" />, label: 'Delivery ETA', value: 'Nilgiri Produce @ 4:00 PM' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 pb-3 border-b border-[#f0ede8] last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-lg bg-[#fdf8f0] flex items-center justify-center shrink-0">{row.icon}</div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{row.label}</p>
                      <p className="text-sm font-semibold text-[#02150c]">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Today's Stats */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-5">
                  <h3 className="font-serif text-base font-bold text-[#02150c] mb-4">Today's Performance</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <Flame className="w-4 h-4 text-red-500" />, label: 'Orders Bumped', value: INITIAL_TICKETS.length - tickets.length, max: INITIAL_TICKETS.length },
                      { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, label: 'SOPs Done', value: completedSops, max: sopTasks.length },
                      { icon: <TrendingUp className="w-4 h-4 text-blue-500" />, label: 'Avg Ticket Time', value: '11m', max: null },
                      { icon: <Star className="w-4 h-4 text-[#745b20]" />, label: 'VIP Tables', value: '1', max: null },
                    ].map((stat, i) => (
                      <div key={i} className="bg-[#faf9f6] border border-[#e4e2de] rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">{stat.icon}<span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{stat.label}</span></div>
                        <p className="text-xl font-bold text-[#02150c]">
                          {stat.value}{stat.max !== null && <span className="text-xs text-stone-400 font-normal ml-1">/ {stat.max}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes from Manager */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-amber-800">Manager's Notes for Tonight</h3>
                  </div>
                  <ul className="space-y-2 text-[12px] text-amber-700">
                    <li className="flex items-start gap-2"><span className="font-bold shrink-0">•</span>VIP Chef's Table (Table G2) — 7-course Degustation; Michelin guest. All courses must pass through Executive Chef.</li>
                    <li className="flex items-start gap-2"><span className="font-bold shrink-0">•</span>Truffle season allocation: 4g black truffle reserved per VIP plate; key in cold store.</li>
                    <li className="flex items-start gap-2"><span className="font-bold shrink-0">•</span>Complete all HACCP geo-tagged evidence before 5 PM sign-off review.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Role Switch */}
            {onSwitchRole && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Switch Role:</span>
                {[
                  { label: 'Owner', path: 'owner-management' },
                  { label: 'Admin', path: 'admin-suite' },
                  { label: 'Manager', path: 'manager-operations' },
                  { label: 'HR', path: 'hr-roster' },
                ].map(r => (
                  <button key={r.path} onClick={() => onSwitchRole(r.path)} className="px-2.5 py-1 bg-[#f5f3ef] border border-[#e4e2de] text-xs text-stone-600 rounded-lg hover:bg-[#e4e2de] transition cursor-pointer">
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── 86 Modal ── */}
      {isEightySixModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-0.5">Menu Alert</p>
                <h3 className="font-serif text-xl font-bold text-[#02150c]">Flag Item as 86'd</h3>
              </div>
              <button onClick={() => setIsEightySixModalOpen(false)} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Item Name *</label>
                <input
                  type="text"
                  value={eightySixItem}
                  onChange={e => setEightySixItem(e.target.value)}
                  placeholder="e.g. Ooty Wild Morel Mushrooms"
                  className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Reason</label>
                <textarea
                  rows={2}
                  value={eightySixReason}
                  onChange={e => setEightySixReason(e.target.value)}
                  placeholder="e.g. Stock exhausted during lunch service"
                  className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsEightySixModalOpen(false)} className="flex-1 border border-[#e4e2de] text-stone-600 text-sm font-bold py-2.5 rounded-xl hover:bg-[#f5f3ef] transition cursor-pointer">Cancel</button>
                <button type="button" onClick={handleConfirmEightySix} disabled={!eightySixItem.trim()} className="flex-1 bg-red-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-red-700 transition cursor-pointer disabled:opacity-50">
                  Confirm 86'd
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Evidence Upload Modal (Geo-Tagged) ── */}
      <EvidenceUploadModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        taskId={selectedTaskId}
        taskTitle={selectedTaskTitle}
        taskCategory={selectedTaskCategory}
        user={user}
        onEvidenceUploaded={() => {
          showToast(`Geo-tagged evidence submitted for: ${selectedTaskTitle}`);
          refetchTasks();
        }}
      />
    </div>
  );
};

export default ChefDashboard;
