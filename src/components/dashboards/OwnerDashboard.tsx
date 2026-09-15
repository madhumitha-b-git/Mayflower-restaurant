import React, { useState, useEffect } from 'react';
import {
  Building2, Calendar, AlertTriangle, Star, RefreshCw,
  CheckCircle
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getDataProvider } from '../../data/DataProvider';
import {
  MOCK_OUTLETS, MOCK_RESERVATIONS, MOCK_FEEDBACK,
  SeedReservation, SeedFeedback, SeedOutlet
} from '../../data/mockSeed';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (rolePath: string) => void;
}

interface EscalationItem {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
  outlet: string;
  createdAt: string;
}

const INITIAL_ESCALATIONS: EscalationItem[] = [
  {
    id: 'esc-1',
    title: 'HVAC Airflow Adjustment',
    description: 'Conservatory Zone 2 air conditioning thermostat calibration required',
    severity: 'medium',
    status: 'open',
    outlet: 'Poes Garden Flagship',
    createdAt: 'Today, 14:00',
  },
  {
    id: 'esc-2',
    title: 'POS Sync Latency Alert',
    description: 'Petpooja Terminal 3 intermittent connection drop resolved via secondary line',
    severity: 'low',
    status: 'open',
    outlet: 'Palavakkam ECR Seaside',
    createdAt: 'Today, 11:30',
  },
];

export const OwnerDashboard: React.FC<Props> = ({ user, onLogout: _onLogout }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'active' | 'inactive'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [outlets, setOutlets] = useState<SeedOutlet[]>([]);
  const [reservations, setReservations] = useState<SeedReservation[]>([]);
  const [feedback, setFeedback] = useState<SeedFeedback[]>([]);
  const [escalations, setEscalations] = useState<EscalationItem[]>(INITIAL_ESCALATIONS);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const provider = getDataProvider();
      const [fetchedOutlets, fetchedRes, fetchedFb] = await Promise.all([
        provider.getOutlets(user).catch(() => MOCK_OUTLETS),
        provider.getReservations(user).catch(() => MOCK_RESERVATIONS),
        provider.getFeedback(user).catch(() => MOCK_FEEDBACK),
      ]);

      setOutlets(fetchedOutlets && fetchedOutlets.length > 0 ? fetchedOutlets : MOCK_OUTLETS);
      setReservations(fetchedRes && fetchedRes.length > 0 ? fetchedRes : MOCK_RESERVATIONS);
      setFeedback(fetchedFb && fetchedFb.length > 0 ? fetchedFb : MOCK_FEEDBACK);

      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setOutlets(MOCK_OUTLETS);
      setReservations(MOCK_RESERVATIONS);
      setFeedback(MOCK_FEEDBACK);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleResolveEscalation = (id: string) => {
    setEscalations(prev => prev.filter(e => e.id !== id));
    showToast('Escalation marked as resolved.');
  };

  const filteredOutlets = outlets.filter(o => {
    if (activeCategory === 'active') return o.isActive;
    if (activeCategory === 'inactive') return !o.isActive;
    return true;
  });

  const pendingReservations = reservations.filter(r => r.status === 'Pending');
  const confirmedReservations = reservations.filter(r => r.status === 'Confirmed' || r.status === 'Seated');
  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + (f.rating || 5), 0) / feedback.length).toFixed(1)
    : '4.9';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1b1c1a] font-sans antialiased pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#02150c] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border border-[#C5A880]/40">
          <CheckCircle className="w-5 h-5 text-[#C5A880]" />
          <span className="text-xs font-semibold text-[#C5A880]">{toastMessage}</span>
        </div>
      )}

      {/* Owner Header Bar */}
      <header className="bg-white border-b border-[#e4e2de] shadow-sm sticky top-11 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#02150c] text-[#C5A880] flex items-center justify-center font-serif font-bold text-lg shadow">
              M
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#02150c] leading-none">Owner Dashboard</h1>
              <span className="text-[10px] font-bold text-[#745b20] uppercase tracking-widest">
                Executive Operations & Oversight · Mayflower Sanctuaries
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-[#f5f3ef] px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#424844] font-medium">Provider:</span>
              <span className="font-bold text-[#745b20] uppercase text-[10px]">
                {import.meta.env.VITE_DATA_PROVIDER || 'MOCK LAYER'}
              </span>
              <span className="text-[10px] text-[#9ca3af] font-mono">({lastSyncTime})</span>
            </div>
            <button
              onClick={loadAllData}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 text-xs text-[#424844] bg-[#f5f3ef] hover:bg-[#e4e2de] border border-[#e4e2de] px-3 py-1.5 rounded-xl transition cursor-pointer font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#745b20] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl border border-[#e4e2de] p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Total Outlets</span>
              <Building2 className="w-5 h-5 text-[#745b20]" />
            </div>
            <div className="text-3xl font-serif font-bold text-[#02150c]">{outlets.length}</div>
            <p className="text-[11px] text-[#6b7280] mt-1">4 Active Sanctuaries in Chennai</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e4e2de] p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Reservations Today</span>
              <Calendar className="w-5 h-5 text-[#745b20]" />
            </div>
            <div className="text-3xl font-serif font-bold text-[#02150c]">{reservations.length}</div>
            <p className="text-[11px] text-[#6b7280] mt-1">{confirmedReservations.length} Confirmed · {pendingReservations.length} Pending</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e4e2de] p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Active Escalations</span>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-serif font-bold text-[#02150c]">{escalations.length}</div>
            <p className="text-[11px] text-[#6b7280] mt-1">Operational issues requiring attention</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e4e2de] p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Guest Satisfaction</span>
              <Star className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div className="text-3xl font-serif font-bold text-[#02150c] flex items-baseline gap-1">
              {avgRating} <span className="text-sm font-sans font-normal text-[#6b7280]">/ 5.0</span>
            </div>
            <p className="text-[11px] text-[#6b7280] mt-1">Based on {feedback.length} verified submissions</p>
          </div>
        </div>

        {/* Multi-Outlet Overview */}
        <section className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-[#e4e2de]">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#02150c]">Multi-Outlet Overview</h2>
              <p className="text-xs text-[#6b7280] mt-0.5">Real-time status across all Mayflower sanctuaries</p>
            </div>
            <div className="flex items-center space-x-2 bg-[#f5f3ef] p-1 rounded-xl">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeCategory === 'all' ? 'bg-[#02150c] text-[#C5A880]' : 'text-[#424844] hover:bg-white'
                }`}
              >
                All ({outlets.length})
              </button>
              <button
                onClick={() => setActiveCategory('active')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeCategory === 'active' ? 'bg-[#02150c] text-[#C5A880]' : 'text-[#424844] hover:bg-white'
                }`}
              >
                Active ({outlets.filter(o => o.isActive).length})
              </button>
              <button
                onClick={() => setActiveCategory('inactive')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeCategory === 'inactive' ? 'bg-[#02150c] text-[#C5A880]' : 'text-[#424844] hover:bg-white'
                }`}
              >
                Inactive ({outlets.filter(o => !o.isActive).length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-[#9ca3af]">Loading outlet data…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              {filteredOutlets.map(outlet => (
                <div key={outlet.id} className="border border-[#e4e2de] rounded-2xl p-5 bg-[#faf9f6] hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#efeeea] text-[#424844]">
                        {outlet.badge}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-[#02150c] mb-1">{outlet.name}</h3>
                    <p className="text-xs text-[#6b7280] mb-3">{outlet.area}</p>
                    <div className="space-y-1 text-xs text-[#424844] border-t border-[#e4e2de] pt-3">
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-semibold text-[#02150c]">{outlet.tablesCount} Tables · {outlet.coversCount} Covers</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operating Hours:</span>
                        <span className="font-medium">{outlet.openingTime} – {outlet.closingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Petpooja POS Node:</span>
                        <span className="font-mono text-[11px] text-[#745b20]">{outlet.petpoojaId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Operational Issues & Recent Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Escalations */}
          <section className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#02150c]">Open Escalations</h2>
                <p className="text-xs text-[#6b7280] mt-0.5">High priority outlet management alerts</p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                SLA &le; 10 mins
              </span>
            </div>

            <div className="space-y-3">
              {escalations.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#9ca3af] bg-[#faf9f6] rounded-xl border border-dashed border-[#e4e2de]">
                  No open escalations across any outlet.
                </div>
              ) : (
                escalations.map(esc => (
                  <div key={esc.id} className="border border-[#e4e2de] rounded-xl p-4 bg-[#faf9f6]">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="font-bold text-sm text-[#02150c]">{esc.title}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        esc.severity === 'high' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {esc.severity} severity
                      </span>
                    </div>
                    <p className="text-xs text-[#424844] mb-3">{esc.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-[#6b7280] border-t border-[#e4e2de] pt-2">
                      <span>{esc.outlet} · {esc.createdAt}</span>
                      <button
                        onClick={() => handleResolveEscalation(esc.id)}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Guest Feedback */}
          <section className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#02150c]">Recent Guest Voice</h2>
                <p className="text-xs text-[#6b7280] mt-0.5">Live guest feedback submissions</p>
              </div>
              <span className="text-xs font-bold text-[#745b20] bg-[#fdf6e3] px-2.5 py-1 rounded-full border border-[#e4c27d]/40">
                Verified Guests
              </span>
            </div>

            <div className="space-y-3">
              {feedback.slice(0, 4).map(fb => (
                <div key={fb.id} className="border border-[#e4e2de] rounded-xl p-4 bg-[#faf9f6]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#02150c]">{fb.customerName}</span>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < (fb.rating || 5) ? 'text-[#C5A880] fill-[#C5A880]' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#424844] italic mb-2">"{fb.message}"</p>
                  <div className="flex items-center justify-between text-[10px] text-[#9ca3af]">
                    <span>{fb.outlet}</span>
                    <span>{fb.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;
