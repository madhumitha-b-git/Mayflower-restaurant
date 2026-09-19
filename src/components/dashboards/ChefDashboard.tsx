import React, { useState, useEffect } from 'react';
import {
  Flame, Clock, CheckCircle2, RefreshCw,
  Printer, ShieldAlert, X, Sparkles, Camera, Image as ImageIcon
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
    id: 'ticket-c1',
    table: 'Table C1',
    guests: 4,
    server: 'Karthik',
    type: 'A La Carte',
    timerStartSeconds: 360,
    stage: 'Plating Stage',
    items: [
      {
        name: '2x Smoked Burrata Pugliese',
        desc: 'Heirloom tomato concassé, cold-pressed basil oil, crispy sourdough wafer',
        badge: 'Pass Ready',
        badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        note: 'Nut Allergy: Guest 2',
      },
    ],
    pairing: {
      title: 'Sommelier Pairing Fired',
      desc: '2x 2021 Domaine Dujac Morey-Saint-Denis Pinot Noir',
      status: 'Poured',
    },
  },
  {
    id: 'ticket-c5',
    table: 'Table C5',
    guests: 4,
    server: 'Arvind',
    type: 'Course 3 of 4',
    timerStartSeconds: 840,
    stage: 'Over Target (12m)',
    isRush: true,
    items: [
      {
        name: '3x Braised Nilgiri Lamb Shank',
        desc: 'Sous-vide 36hr, rosemary jus reduction, roasted baby shallots',
        badge: 'Line Firing',
        badgeColor: 'bg-red-50 text-red-700 border border-red-200',
        note: 'Temp: Medium-Well for Seat 3',
      },
      {
        name: '1x Morel Mushroom Risotto',
        desc: 'Acquerello carnaroli, 24mo Parmigiano Reggiano, Ooty morel froth',
        badge: 'Finishing Mantecare',
        badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
      },
    ],
  },
  {
    id: 'ticket-g2',
    table: 'Table G2',
    guests: 4,
    server: 'Priya',
    type: '7-Course Degustation',
    timerStartSeconds: 495,
    stage: 'Course 5 of 7',
    isVip: true,
    vipTitle: "Chef's Table VIP",
    items: [
      {
        name: '2x Smoked Nilgiri Morel Risotto',
        desc: 'Garnished with edible gold leaf & winter black truffle shavings at tableside',
        badge: 'Pass Ready',
        badgeColor: 'bg-[#02150c] text-[#C5A880]',
      },
    ],
    nextCourse: {
      name: 'Pan-Seared Bay of Bengal Sea Bass, Velouté & Sea Fennel',
      status: 'Pre-fire command sent to Station A (Pan Station)',
    },
  },
  {
    id: 'ticket-v1',
    table: 'Table V1',
    guests: 2,
    server: 'Deepa',
    type: 'Veranda Booth',
    timerStartSeconds: 120,
    stage: 'Fresh Order',
    items: [
      {
        name: '1x House Sourdough & Whipped Cultured Butter',
        desc: 'Maldon sea salt, roasted garlic ash infusion',
        badge: 'Larder Queued',
        badgeColor: 'bg-gray-100 text-gray-700',
      },
      {
        name: '2x Seared Coromandel Sea Bass',
        desc: 'Lemongrass velouté, pickled samphire, charred leek',
        badge: 'Pending App',
        badgeColor: 'bg-gray-100 text-gray-700',
      },
    ],
  },
];

export const ChefDashboard: React.FC<Props> = ({ user }) => {
  const [selectedSanctuary, setSelectedSanctuary] = useState('Poes Garden Flagship');
  const [serviceClock, setServiceClock] = useState('19:42:18 IST');
  const [activeKdsFilter, setActiveKdsFilter] = useState<'all' | 'degustation' | 'alacarte'>('all');

  const [isEightySixModalOpen, setIsEightySixModalOpen] = useState(false);
  const [eightySixItem, setEightySixItem] = useState('Ooty Wild Morel Mushrooms');
  const [eightySixReason, setEightySixReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');

  const { data: kitchenTasks, refetch: refetchTasks } = useTasks(user);
  const [tickets, setTickets] = useState<KDSTicket[]>(INITIAL_TICKETS);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setServiceClock(now.toLocaleTimeString('en-GB') + ' IST');
    }, 1000);

    const timerInterval = setInterval(() => {
      setTickets(prev => prev.map(t => ({ ...t, timerStartSeconds: t.timerStartSeconds + 1 })));
    }, 1000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const handleBumpTicket = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    showToast(`Ticket ${id.toUpperCase()} completed and bumped to Pass.`);
  };

  const handleDuplicateKot = (tableName: string) => {
    showToast(`Duplicate KOT printed on Kitchen Pass Printer for ${tableName}`);
  };

  const handleConfirmEightySix = () => {
    setIsEightySixModalOpen(false);
    showToast(`Item "${eightySixItem}" is now 86'd. Kitchen, Bar & Floor notified.`);
    setEightySixReason('');
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      await getDataProvider().updateTaskStatus(user, taskId, newStatus);
      showToast(`Kitchen SOP updated to ${newStatus}`);
      refetchTasks();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (activeKdsFilter === 'degustation') return t.isVip || t.type.includes('Degustation');
    if (activeKdsFilter === 'alacarte') return !t.isVip && !t.type.includes('Degustation');
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1b1c1a] font-sans antialiased pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#02150c] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border border-[#C5A880]/40">
          <Sparkles className="w-5 h-5 text-[#C5A880]" />
          <span className="text-xs font-semibold text-[#C5A880]">{toastMessage}</span>
        </div>
      )}

      {/* Chef Header */}
      <header className="bg-white border-b border-[#e4e2de] shadow-sm sticky top-11 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#02150c] text-[#C5A880] flex items-center justify-center font-serif font-bold text-lg shadow">
              M
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#02150c] leading-none">Kitchen Display System (KDS)</h1>
              <span className="text-[10px] font-bold text-[#745b20] uppercase tracking-widest">
                Executive Chef & Operations · Mayflower Sanctuaries
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-[#f5f3ef] px-3 py-1.5 rounded-xl text-xs">
              <Clock className="w-3.5 h-3.5 text-[#745b20]" />
              <span className="font-mono font-bold text-[#02150c]">{serviceClock}</span>
            </div>
            <select
              value={selectedSanctuary}
              onChange={e => setSelectedSanctuary(e.target.value)}
              className="bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-1.5 text-xs font-bold text-[#02150c] focus:outline-none cursor-pointer"
            >
              <option value="Poes Garden Flagship">Poes Garden Flagship</option>
              <option value="Palavakkam ECR Seaside">Palavakkam ECR Seaside</option>
              <option value="Anna Nagar East Pavilion">Anna Nagar East Pavilion</option>
              <option value="Velachery Lakeside Conservatory">Velachery Lakeside Conservatory</option>
            </select>
            <button
              onClick={() => setIsEightySixModalOpen(true)}
              className="flex items-center space-x-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>86 Item</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KDS Station Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#02150c] text-white p-6 rounded-3xl shadow-md">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Flame className="w-5 h-5 text-[#C5A880] animate-pulse" />
              <span className="text-[#C5A880] text-xs font-bold uppercase tracking-widest">Live Kitchen Pass</span>
            </div>
            <h2 className="font-serif text-2xl font-bold">Active Orders & Course Pace</h2>
            <p className="text-xs text-[#a8b5a0] mt-0.5">{tickets.length} active tickets queued on the line</p>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveKdsFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeKdsFilter === 'all' ? 'bg-[#C5A880] text-[#02150c]' : 'text-white hover:bg-white/10'
              }`}
            >
              All Tickets ({tickets.length})
            </button>
            <button
              onClick={() => setActiveKdsFilter('degustation')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeKdsFilter === 'degustation' ? 'bg-[#C5A880] text-[#02150c]' : 'text-white hover:bg-white/10'
              }`}
            >
              Degustation / VIP
            </button>
            <button
              onClick={() => setActiveKdsFilter('alacarte')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeKdsFilter === 'alacarte' ? 'bg-[#C5A880] text-[#02150c]' : 'text-white hover:bg-white/10'
              }`}
            >
              À La Carte
            </button>
          </div>
        </div>

        {/* Live KDS Ticket Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTickets.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-[#e4e2de] shadow-sm text-sm text-[#9ca3af]">
              No active KDS tickets in queue. Pass is clear!
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                className={`bg-white rounded-2xl border ${
                  ticket.isRush ? 'border-red-300 ring-2 ring-red-100' : 'border-[#e4e2de]'
                } shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden`}
              >
                <div>
                  {/* Ticket Header */}
                  <div className={`p-4 border-b border-[#e4e2de] ${
                    ticket.isVip ? 'bg-[#02150c] text-white' : 'bg-[#faf9f6]'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-sm ${ticket.isVip ? 'text-[#C5A880]' : 'text-[#02150c]'}`}>
                        {ticket.table}
                      </span>
                      <div className="flex items-center space-x-1 font-mono text-xs font-bold text-[#745b20]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTimer(ticket.timerStartSeconds)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] opacity-80">
                      <span>{ticket.guests} Guests · Server: {ticket.server}</span>
                      <span className="font-semibold">{ticket.type}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4 space-y-3">
                    {ticket.items.map((item, idx) => (
                      <div key={idx} className="space-y-1 pb-2 border-b border-[#f0ede8] last:border-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs text-[#02150c] leading-tight">{item.name}</span>
                          {item.badge && (
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${item.badgeColor || 'bg-gray-100'}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.desc && <p className="text-[11px] text-[#6b7280] leading-normal">{item.desc}</p>}
                        {item.note && (
                          <div className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                            Note: {item.note}
                          </div>
                        )}
                      </div>
                    ))}

                    {ticket.nextCourse && (
                      <div className="bg-[#f5f3ef] border border-[#e4e2de] rounded-xl p-2.5 text-[11px]">
                        <span className="font-bold text-[#745b20] uppercase text-[9px] block">Next Course:</span>
                        <span className="font-semibold text-[#02150c]">{ticket.nextCourse.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ticket Actions */}
                <div className="p-3 bg-[#faf9f6] border-t border-[#e4e2de] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDuplicateKot(ticket.table)}
                    className="p-2 rounded-lg border border-[#e4e2de] bg-white hover:bg-[#f5f3ef] text-[#424844] transition cursor-pointer"
                    title="Print Duplicate KOT"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleBumpTicket(ticket.id)}
                    className="flex-1 bg-[#02150c] text-[#C5A880] text-xs font-bold py-2 rounded-xl hover:bg-[#0a2a18] transition cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Bump Order</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* HACCP & Kitchen SOP Checklists */}
        <section className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#02150c]">HACCP & Kitchen Prep SOPs</h2>
              <p className="text-xs text-[#6b7280] mt-0.5">Mandatory sanitation, temperature logs & station checklists</p>
            </div>
            <button
              onClick={() => refetchTasks()}
              className="flex items-center space-x-1 text-xs text-[#424844] bg-[#f5f3ef] px-3 py-1.5 rounded-xl hover:bg-[#e4e2de] transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync Checklists</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kitchenTasks && kitchenTasks.length > 0 ? (
              kitchenTasks.map(task => (
                <div key={task.id} className="border border-[#e4e2de] rounded-xl p-4 bg-[#faf9f6] flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#745b20]">{task.category}</span>
                    <h4 className="font-bold text-xs text-[#02150c] mt-0.5">{task.title}</h4>
                    <p className="text-[11px] text-[#6b7280] mt-1">Due: {task.dueAt}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer w-full text-center ${
                        task.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-[#02150c] text-[#C5A880] border-[#02150c]'
                      }`}
                    >
                      {task.status === 'Completed' ? '✓ Done' : 'Complete'}
                    </button>
                    {task.status !== 'Completed' ? (
                      <button
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setSelectedTaskTitle(task.title);
                          setEvidenceModalOpen(true);
                        }}
                        className="px-2.5 py-1 flex items-center justify-center space-x-1 rounded-lg text-[10px] font-bold border border-[#e4e2de] bg-white text-[#424844] hover:bg-[#f5f3ef] transition cursor-pointer w-full"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Upload</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                        <ImageIcon className="w-3 h-3" />
                        <span>Evidence</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              [
                { id: 'sop-1', title: 'Line Sanitizer Bucket PPM Check', category: 'Sanitation', due: '11:00 AM' },
                { id: 'sop-2', title: 'Walk-in Cooler Temp Log (Target &lt; 3.5°C)', category: 'HACCP', due: '12:00 PM' },
                { id: 'sop-3', title: 'Protein Thawing & Date Tag Audit', category: 'Prep', due: '02:00 PM' },
              ].map(item => (
                <div key={item.id} className="border border-[#e4e2de] rounded-xl p-4 bg-[#faf9f6] flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#745b20]">{item.category}</span>
                    <h4 className="font-bold text-xs text-[#02150c] mt-0.5">{item.title}</h4>
                    <p className="text-[11px] text-[#6b7280] mt-1">Due: {item.due}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => showToast(`Completed ${item.title}`)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#02150c] text-[#C5A880] border border-[#02150c] hover:bg-[#0a2a18] transition cursor-pointer w-full text-center"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTaskId(item.id);
                        setSelectedTaskTitle(item.title);
                        setEvidenceModalOpen(true);
                      }}
                      className="px-2.5 py-1 flex items-center justify-center space-x-1 rounded-lg text-[10px] font-bold border border-[#e4e2de] bg-white text-[#424844] hover:bg-[#f5f3ef] transition cursor-pointer w-full"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* 86 Item Modal */}
      {isEightySixModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-[#02150c]">86 Menu Item</h3>
              <button onClick={() => setIsEightySixModalOpen(false)} className="text-[#6b7280] hover:text-[#02150c] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Item Name</label>
                <input
                  type="text"
                  value={eightySixItem}
                  onChange={e => setEightySixItem(e.target.value)}
                  className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Reason (Optional)</label>
                <textarea
                  rows={2}
                  value={eightySixReason}
                  onChange={e => setEightySixReason(e.target.value)}
                  placeholder="e.g. Stock exhausted during lunch service"
                  className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEightySixModalOpen(false)}
                  className="flex-1 border border-[#e4e2de] text-[#424844] text-sm font-bold py-2.5 rounded-xl hover:bg-[#f5f3ef] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEightySix}
                  className="flex-1 bg-red-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-red-700 transition cursor-pointer"
                >
                  Confirm 86'd
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <EvidenceUploadModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        taskId={selectedTaskId}
        taskTitle={selectedTaskTitle}
        user={user}
        onEvidenceUploaded={() => {
          showToast(`Evidence uploaded for ${selectedTaskTitle}`);
          refetchTasks();
        }}
      />
    </div>
  );
};

export default ChefDashboard;
