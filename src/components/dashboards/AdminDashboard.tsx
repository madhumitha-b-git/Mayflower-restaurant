import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Building2, CheckSquare, ClipboardList, Clock, FileText, LogOut, Plus, RefreshCw, Search, Star, Users, X, UtensilsCrossed } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { AdminOperationalData, createStaffMember, fetchAdminOperationalData, toggleStaffActive, updateStaffAssignment } from '../../lib/adminService';
import { FranchiseAdminPanel } from './admin/FranchiseAdminPanel';
import { MenuAdminPanel } from './admin/MenuAdminPanel';
import { SOPChecklistManagement } from './shared/SOPChecklistManagement';
import { OutletManagement } from './shared/OutletManagement';
import { useFranchiseEnquiries } from '../../hooks/useAppData';
import { useSafeNavigate, useSafeLocation } from '../../routes/roleRoutes';
import { isValidEmailDomain, EMAIL_VALIDATION_MESSAGE } from '../../lib/validation';
import { supabase } from '../../lib/supabaseClient';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

const empty: AdminOperationalData = { staff: [], outlets: [], tables: [], reservations: [], checklists: [], tasks: [], feedback: [], franchiseLeads: [], auditLogs: [] };
const roles: UserRole[] = ['Owner', 'Admin', 'Manager', 'Chef', 'HR', 'Accountant'];
const date = (v?: string | null) => v ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(v)) : '—';
const style = (v: unknown) => {
  const x = String(v).toLowerCase();
  return v === true || ['active','confirmed','done','completed','resolved','open'].includes(x) ? 'bg-emerald-50 text-emerald-800' : v === false || ['inactive','cancelled','no-show','unresolved','escalated'].includes(x) ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800';
};

export const AdminDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const navigate = useSafeNavigate();
  const location = useSafeLocation();

  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [outlet, setOutlet] = useState('all');
  const [role, setRole] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', role: 'Manager' as UserRole, outlet: '' });

  const { data: franchiseEnquiries, refetch: refetchFranchise } = useFranchiseEnquiries(user);

  // Sub-route tab detection
  const currentSubTab = useMemo(() => {
    if (location.pathname.includes('/menu')) return 'menu';
    if (location.pathname.includes('/franchise')) return 'franchise';
    if (location.pathname.includes('/outlets')) return 'outlets';
    if (location.pathname.includes('/sops') || location.pathname.includes('/checklists')) return 'sops';
    if (location.pathname.includes('/feedback')) return 'feedback';
    return 'overview';
  }, [location.pathname]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAdminOperationalData());
      refetchFranchise();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();

    // Supabase Realtime channel for instant live updates
    const channel = supabase
      .channel('admin-dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        void load();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => {
        void load();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        void load();
      })
      .subscribe();

    // Window event listeners for local actions
    const onRefresh = () => void load();
    window.addEventListener('mayflower_reservation_created', onRefresh);
    window.addEventListener('mayflower_feedback_updated', onRefresh);

    // Periodic live poll every 6 seconds to ensure fresh data
    const interval = setInterval(() => {
      void load();
    }, 6000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('mayflower_reservation_created', onRefresh);
      window.removeEventListener('mayflower_feedback_updated', onRefresh);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const filteredStaff = useMemo(() => data.staff
    .filter(s => (s.role || '').toLowerCase() !== 'customer' && (s.role || '').toLowerCase() !== 'guest')
    .filter(s => `${s.name} ${s.email} ${s.role} ${s.outlet_name ?? s.outlet ?? ''}`.toLowerCase().includes(query.toLowerCase()) && (role === 'all' || s.role === role) && (outlet === 'all' || s.outlet_name === outlet || s.outlet === outlet)),
    [data.staff, query, role, outlet]
  );
  const byOutlet = <T extends { outlet?: string | null }>(rows: T[]) => outlet === 'all' ? rows : rows.filter(r => r.outlet === outlet);

  const editAssignment = async (staff: any) => {
    const nextRole = window.prompt('Role', staff.role);
    const nextOutlet = window.prompt('Outlet name (blank unassigns)', staff.outlet_name ?? staff.outlet ?? '');
    if (!nextRole || !roles.includes(nextRole as UserRole)) return;
    const result = await updateStaffAssignment(staff.id, nextRole as UserRole, nextOutlet || null);
    setNotice(result.error ?? `${staff.name}'s assignment updated.`);
    if (!result.error) void load();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmailDomain(form.email)) {
      setNotice(EMAIL_VALIDATION_MESSAGE);
      return;
    }
    const result = await createStaffMember(form);
    setNotice(result.error ?? 'Staff user provisioned.');
    if (!result.error) {
      setAddOpen(false);
      setForm({ name: '', email: '', mobile: '', password: '', role: 'Manager', outlet: '' });
      void load();
    }
  };

  const metrics = [
    ['Active staff', data.staff.filter(s => (s.role || '').toLowerCase() !== 'customer' && s.is_active).length, Users],
    ['Total reservations', data.reservations.length, Clock],
    ['Open tasks', data.tasks.filter(t => !['Done','Completed'].includes(t.status)).length, CheckSquare],
    ['Unresolved feedback', data.feedback.filter(f => f.status !== 'Resolved' && f.status !== 'resolved' && !f.is_resolved).length, Star]
  ] as const;

  return (
    <div className="min-h-screen bg-[#fbf9f5] pb-16 font-sans text-[#1b1c1a]">
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#02150c] px-4 py-3 text-xs font-semibold text-white shadow-xl">
          {notice}
        </div>
      )}

      {/* Admin Subnav Header */}
      <header className="sticky top-10 z-40 border-b border-[#e4e2de] bg-[#fbf9f5]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#02150c] font-serif text-lg font-bold text-[#e4c27d]">
              M
            </div>
            <div>
              <div className="font-serif text-base font-bold text-[#02150c]">Mayflower</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#745b20]">Administration</div>
            </div>
          </div>

          {/* Subroutes Navigation Bar */}
          <nav className="hidden sm:flex items-center gap-1 bg-[#edeae4] p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => navigate('/admin')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentSubTab === 'overview' ? 'bg-white text-[#02150c] shadow-xs' : 'text-stone-600 hover:text-black'
              }`}
            >
              Overview & Staff
            </button>
            <button
              onClick={() => navigate('/admin/menu')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentSubTab === 'menu' ? 'bg-white text-[#02150c] shadow-xs' : 'text-stone-600 hover:text-black'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Menu Catalog
            </button>
            <button
              onClick={() => navigate('/admin/franchise')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentSubTab === 'franchise' ? 'bg-white text-[#02150c] shadow-xs' : 'text-stone-600 hover:text-black'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Franchise
            </button>
            <button
              onClick={() => navigate('/admin/outlets')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentSubTab === 'outlets' ? 'bg-white text-[#02150c] shadow-xs' : 'text-stone-600 hover:text-black'
              }`}
            >
              Outlets & Capacity
            </button>
            <button
              onClick={() => navigate('/admin/sops')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentSubTab === 'sops' ? 'bg-white text-[#02150c] shadow-xs' : 'text-stone-600 hover:text-black'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              SOP & Checklists
            </button>
            <button
              onClick={() => navigate('/admin/feedback')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentSubTab === 'feedback' ? 'bg-white text-[#02150c] shadow-xs' : 'text-stone-600 hover:text-black'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              Guest Feedback
            </button>
          </nav>

          <div className="flex gap-2">
            {onSwitchRole && user.role === 'SuperAdmin' && (
              <select
                onChange={e => onSwitchRole(e.target.value)}
                defaultValue="admin-suite"
                className="rounded-lg border border-[#e4e2de] bg-white px-2 py-1.5 text-xs"
              >
                <option value="admin-suite">Admin console</option>
                <option value="owner-management">Owner dashboard</option>
                <option value="manager-operations">Operations</option>
              </select>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 pt-6">
        
        {/* KPI Section */}
        <section className="rounded-2xl border border-[#e4e2de] bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#745b20]">Operational configuration</span>
              <h1 className="font-serif text-3xl font-bold text-[#02150c]">Admin Dashboard</h1>
              <p className="mt-1 max-w-2xl text-xs text-[#424844]">Manage people, menu offerings, outlets, service capacity, and franchise pipeline.</p>
            </div>
            <button
              onClick={() => void load()}
              disabled={loading}
              className="flex h-fit items-center gap-1 rounded-xl border border-[#e4e2de] bg-[#f5f3ef] px-3 py-2 text-xs font-bold"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh
            </button>
          </div>
          {error && (
            <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {metrics.map(([label, value, Icon]) => (
              <div key={label} className="rounded-xl border border-[#e4e2de] bg-[#f5f3ef] p-4">
                <div className="flex justify-between text-[10px] font-bold uppercase text-[#424844]">
                  <span>{label}</span>
                  <Icon className="h-4 w-4 text-[#745b20]" />
                </div>
                <div className="mt-2 text-2xl font-bold text-[#02150c]">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Subview Display */}
        {currentSubTab === 'menu' && (
          <MenuAdminPanel />
        )}

        {currentSubTab === 'franchise' && (
          <div className="grid gap-6">
            <FranchiseAdminPanel enquiries={franchiseEnquiries} onUpdate={() => void load()} />
          </div>
        )}

        {currentSubTab === 'outlets' && (
          <OutletManagement user={user} />
        )}

        {currentSubTab === 'sops' && (
          <SOPChecklistManagement user={user} />
        )}

        {currentSubTab === 'feedback' && (
          <section className="space-y-6">
            <Panel 
              title="Guest Feedback & Dining Sentiment" 
              eyebrow="Voice of customer" 
              icon={Star}
              action={
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {data.feedback.length} Live Submissions
                  </span>
                </div>
              }
            >
              {data.feedback.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-sm">
                  No guest feedback records found in database.
                </div>
              ) : (
                <div className="divide-y divide-[#e4e2de]">
                  {data.feedback.map((fb: any) => (
                    <div key={fb.id} className="py-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#02150c]">
                              {fb.customer_name || fb.guest_name || 'Guest'}
                            </span>
                            {fb.email && <span className="text-xs text-stone-400">({fb.email})</span>}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#02150c]/10 text-[#02150c] font-semibold">
                              {fb.outlet_name || fb.outlet || 'Poes Garden'}
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
                            <span className="text-xs text-stone-600 ml-1.5 font-medium">{fb.rating}/5</span>
                            <span className="text-[10px] text-stone-400 ml-3">{date(fb.created_at)}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          fb.status === 'resolved' || fb.is_resolved
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {fb.status || 'New'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed bg-[#f5f3ef] p-3 rounded-xl border border-[#e4e2de]">
                        "{fb.comments || fb.comment || 'No comment provided'}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </section>
        )}

        {currentSubTab === 'overview' && (
          <>
            <Panel title="User, role and outlet assignment" eyebrow="People & access" icon={Users} action={<button onClick={() => setAddOpen(true)} className="flex items-center gap-1 rounded-lg bg-[#02150c] px-3 py-2 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" />Add staff</button>}>
              <div className="mb-4 flex flex-col gap-2 md:flex-row">
                <label className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people, roles or outlets" className="w-full rounded-xl border border-[#e4e2de] bg-[#f5f3ef] py-2 pl-9 pr-3 text-xs" />
                </label>
                <select value={role} onChange={e => setRole(e.target.value)} className="rounded-xl border border-[#e4e2de] bg-[#f5f3ef] px-3 py-2 text-xs">
                  <option value="all">All roles</option>
                  {roles.map(r => <option key={r}>{r}</option>)}
                </select>
                <OutletSelect outlets={data.outlets} value={outlet} onChange={setOutlet} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e4e2de] text-[10px] uppercase text-stone-500">
                      <th className="py-2">Staff</th>
                      <th>Role</th>
                      <th>Outlet</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map(s => (
                      <tr key={s.id} className="border-b border-[#e4e2de]/60">
                        <td className="py-2.5 font-bold text-[#02150c]">{s.name} <span className="block font-normal text-stone-500">{s.email}</span></td>
                        <td><span className="rounded-md bg-[#edeae4] px-2 py-0.5 text-[10px] font-bold text-[#02150c]">{s.role}</span></td>
                        <td>{s.outlet_name ?? s.outlet ?? 'Unassigned'}</td>
                        <td><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style(s.is_active)}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td className="text-right">
                          <button onClick={() => void editAssignment(s)} className="mr-2 text-stone-500 hover:text-black">Edit</button>
                          <button onClick={async () => { await toggleStaffActive(s.id, !s.is_active); void load(); }} className="text-stone-500 hover:text-red-700">{s.is_active ? 'Deactivate' : 'Activate'}</button>
                        </td>
                      </tr>
                    ))}
                    {!loading && filteredStaff.length === 0 && (
                      <tr><td colSpan={5} className="p-5 text-center text-gray-500">No staff match the current filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>

            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Recent reservations" eyebrow="Reservation administration" icon={Clock}>
                <List rows={byOutlet(data.reservations).slice(0, 8)} empty="No reservations available." render={r => <><b>{r.booking_code ?? r.bookingCode ?? 'Reservation'}</b><span>{r.customer_name ? `${r.customer_name} · ` : ''}{r.outlet_name ?? r.outlet ?? 'Poes Garden'} · {r.date || date(r.reservation_date)} · {r.party_size ?? r.guests ?? 0} guests</span><Badge value={r.status || 'Confirmed'} /></>} />
              </Panel>
              <Panel title="Active operational checklists" eyebrow="SOP & checklists" icon={ClipboardList}>
                <List rows={byOutlet(data.checklists).slice(0, 6)} empty="No SOP or checklist records available." render={s => <><b>{s.title ?? s.name}</b><span>{s.outlet ?? s.outlets?.name ?? 'All outlets'} · {s.frequency ?? s.category ?? 'Operational SOP'}</span><Badge value={s.is_active === false ? 'Inactive' : 'Active'} /></>} />
              </Panel>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <FranchiseAdminPanel enquiries={franchiseEnquiries} onUpdate={() => void load()} />
              <Panel title="Recent administrative activity" eyebrow="Basic activity records" icon={FileText}>
                <List rows={data.auditLogs.slice(0, 6)} empty="No activity records available." render={l => <><b>{l.action}</b><span>{l.actor_name ?? 'System'} · {l.entity ?? 'application'} · {date(l.created_at)}</span><Badge value={l.actor_role ?? 'System'} /></>} />
              </Panel>
            </div>
          </>
        )}

      </main>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submit} className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#745b20]">Access provisioning</span>
                <h2 className="font-serif text-xl font-bold">Add staff user</h2>
              </div>
              <button type="button" onClick={() => setAddOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {(['name','email','mobile','password'] as const).map(k => (
              <input
                key={k}
                required={k !== 'mobile'}
                type={k === 'email' ? 'email' : k === 'password' ? 'password' : 'text'}
                minLength={k === 'password' ? 6 : undefined}
                placeholder={k === 'password' ? 'Temporary password' : k[0].toUpperCase() + k.slice(1)}
                value={form[k]}
                onChange={e => setForm({ ...form, [k]: e.target.value })}
                className="field w-full px-3 py-2 border rounded-xl text-xs bg-[#f5f3ef]"
              />
            ))}
            <div className="grid grid-cols-2 gap-3">
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as UserRole })} className="field px-3 py-2 border rounded-xl text-xs bg-[#f5f3ef]">
                {roles.map(r => <option key={r}>{r}</option>)}
              </select>
              <select value={form.outlet} onChange={e => setForm({ ...form, outlet: e.target.value })} className="field px-3 py-2 border rounded-xl text-xs bg-[#f5f3ef]">
                <option value="">Unassigned</option>
                {data.outlets.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
              </select>
            </div>
            <button className="w-full rounded-xl bg-[#02150c] py-2.5 text-xs font-bold text-white">Provision staff user</button>
          </form>
        </div>
      )}
    </div>
  );
};

const Panel = ({ title, eyebrow, icon: Icon, action, children }: { title: string; eyebrow: string; icon: React.ElementType; action?: React.ReactNode; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-[#e4e2de] bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex gap-2">
        <Icon className="mt-0.5 h-4 w-4 text-[#745b20]" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#745b20]">{eyebrow}</div>
          <h2 className="font-serif text-xl font-bold text-[#02150c]">{title}</h2>
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Badge = ({ value }: { value: string }) => <span className={`ml-auto w-fit rounded-full px-2 py-1 text-[10px] font-bold ${style(value)}`}>{value}</span>;
const List = ({ rows, render, empty }: { rows: any[]; render: (row: any) => React.ReactNode; empty: string }) => (
  <div className="space-y-2">
    {rows.map(r => <div key={r.id} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border border-[#e4e2de] bg-[#f5f3ef] px-3 py-2.5 text-xs"><div className="min-w-0 space-y-1">{render(r)}</div></div>)}
    {rows.length === 0 && <div className="rounded-xl border border-dashed border-[#e4e2de] p-4 text-center text-xs text-gray-500">{empty}</div>}
  </div>
);
const OutletSelect = ({ outlets, value, onChange }: { outlets: any[]; value: string; onChange: (v: string) => void }) => (
  <select value={value} onChange={e => onChange(e.target.value)} className="rounded-xl border border-[#e4e2de] bg-[#f5f3ef] px-3 py-2 text-xs">
    <option value="all">All outlets</option>
    {outlets.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
  </select>
);
