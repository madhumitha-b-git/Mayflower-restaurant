import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UserProfile } from '../../types';
import { PlanYourVisit } from '../PlanYourVisit';
import { Calendar, Utensils, Star, CheckCircle, Clock, Users, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onOpenReservations?: () => void;
  onSwitchRole?: (role: string) => void;
  onUpdateUser?: (user: UserProfile) => void;
}

interface CustomerRow {
  dietary_preferences: string[] | null;
  allergies: string | null;
  preferred_seating: string | null;
  total_visits: number;
  loyalty_tier: string | null;
  loyalty_points: number;
}

interface ReservationRow {
  id: string;
  booking_code: string | null;
  outlet: string | null;
  reservation_date: string | null;
  time_slot: string | null;
  guests: number | null;
  status: string | null;
  booked_at: string | null;
  special_occasion: string | null;
  dietary_prefs: string | null;
}

interface FeedbackRow {
  id: string;
  outlet: string | null;
  rating: number | null;
  comment: string | null;
  created_at: string | null;
  visit_date: string | null;
}

interface OutletRow {
  id: string;
  name: string;
}

const RESERVATION_BONUS = 300;
const FEEDBACK_BONUS = 100;



const DEFAULT_OUTLETS: OutletRow[] = [
  { id: 'o1', name: 'Poes Garden' },
  { id: 'o2', name: 'Alwarpet' },
  { id: 'o3', name: 'Anna Nagar' },
  { id: 'o4', name: 'ECR Sanctuary' }
];

export const CustomerDashboard: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [showReservationWizard, setShowReservationWizard] = useState(false);
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackRow[]>([]);
  const [outlets, setOutlets] = useState<OutletRow[]>(DEFAULT_OUTLETS);
  const [loading, setLoading] = useState(true);

  // Inline modification
  const [modifyingId, setModifyingId] = useState<string | null>(null);
  const [modifyDate, setModifyDate] = useState('');
  const [modifySlot, setModifySlot] = useState('');
  const [modifyGuests, setModifyGuests] = useState('');

  // Feedback modal
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [fbOutlet, setFbOutlet] = useState('Poes Garden');
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState('');
  const [fbVisitDate, setFbVisitDate] = useState('');
  const [submittingFb, setSubmittingFb] = useState(false);

  const [toast, setToast] = useState<{ show: boolean; message: string; error?: boolean }>({ show: false, message: '' });

  const showToast = (msg: string, error = false) => {
    setToast({ show: true, message: msg, error });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  useEffect(() => { fetchAll(); }, [user.id, user.reservations?.length, user.rewardPoints]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [custRes, resRes, fbRes, outRes] = await Promise.all([
        supabase.from('customers').select('dietary_preferences,allergies,preferred_seating,total_visits,loyalty_tier,loyalty_points').eq('user_id', user.id).maybeSingle(),
        supabase.from('reservations').select('id,booking_code,reservation_date,time_slot,guests,status,special_occasion,dietary_prefs,outlets(name)').eq('customer_id', user.id).order('reservation_date', { ascending: false }),
        supabase.from('feedback').select('id,outlet,rating,comment,message,created_at,visit_date').or(`user_id.eq.${user.id},customer_id.eq.${user.id}`).order('created_at', { ascending: false }),
        supabase.from('outlets').select('id,name').eq('is_active', true).order('name'),
      ]);
      if (custRes.data) setCustomer(custRes.data as CustomerRow);
      if (resRes.data) {
        setReservations((resRes.data as any[]).map(r => ({
          ...r,
          outlet: r.outlets?.name || r.outlet || 'Mayflower Outlet'
        })));
      }

      let localFb: FeedbackRow[] = [];
      try {
        const saved = localStorage.getItem(`mayflower_feedback_${user.id}`);
        if (saved) localFb = JSON.parse(saved);
      } catch {}

      const dbFb = (fbRes.data ?? []).map((f: any) => ({
        id: f.id,
        outlet: f.outlet || 'Mayflower Outlet',
        rating: f.rating || 5,
        comment: f.comment || f.message || 'Great experience!',
        created_at: f.created_at,
        visit_date: f.visit_date
      }));

      const combinedIds = new Set(dbFb.map(f => f.id));
      const extraLocal = localFb.filter(f => !combinedIds.has(f.id));
      setFeedbackHistory([...dbFb, ...extraLocal]);

      if (outRes.data && outRes.data.length > 0) {
        setOutlets(outRes.data as OutletRow[]);
        setFbOutlet(outRes.data[0].name);
      } else {
        setOutlets(DEFAULT_OUTLETS);
        setFbOutlet(DEFAULT_OUTLETS[0].name);
      }
    } catch { showToast('Failed to load profile data.', true); }
    finally { setLoading(false); }
  };

  const handleModifySave = async (id: string) => {
    const updates: Record<string, string | number> = {};
    if (modifyDate) updates.reservation_date = modifyDate;
    if (modifySlot) updates.time_slot = modifySlot;
    if (modifyGuests) updates.guests = parseInt(modifyGuests);
    const { error } = await supabase.from('reservations').update(updates).eq('id', id).eq('customer_id', user.id);
    if (error) { showToast('Failed to update reservation.', true); return; }
    showToast('Reservation updated successfully.');
    setModifyingId(null);
    fetchAll();
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this reservation? 300 loyalty points will be deducted.')) return;
    const { error: delError } = await supabase.from('reservations').delete().eq('id', id).eq('customer_id', user.id);
    if (delError) { showToast('Failed to cancel reservation.', true); return; }
    const { data: profileData } = await supabase.from('user_profiles').select('reward_points,transactions').eq('id', user.id).single();
    if (profileData) {
      const cancelTx = {
        id: `cancel-${id}`,
        type: 'cancelled_reservation',
        points: -RESERVATION_BONUS,
        description: 'Points deducted for cancelled reservation',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      };
      const newPoints = Math.max(0, (profileData.reward_points ?? 0) - RESERVATION_BONUS);
      const { error: updateError } = await supabase.from('user_profiles').update({
        reward_points: newPoints,
        transactions: [...(profileData.transactions ?? []), cancelTx],
      }).eq('id', user.id);
      if (!updateError && onUpdateUser) {
        const { fetchUserProfile } = await import('../../lib/authService');
        const updated = await fetchUserProfile(user.id);
        if (updated) onUpdateUser(updated);
      }
    }
    showToast('Reservation cancelled. 300 points deducted.');
    fetchAll();
  };

  const handleSubmitFeedback = async () => {
    if (!fbOutlet || !fbComment) { showToast('Please fill outlet and comment.', true); return; }
    if (feedbackedOutlets.has(fbOutlet)) {
      showToast('You have already submitted feedback for this outlet.', true);
      return;
    }
    setSubmittingFb(true);

    const newFbItem: FeedbackRow = {
      id: `fb-${Date.now()}`,
      outlet: fbOutlet,
      rating: fbRating,
      comment: fbComment,
      created_at: new Date().toISOString(),
      visit_date: fbVisitDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    try {
      await supabase.from('feedback').insert({
        user_id: user.id,
        customer_id: user.id,
        outlet: fbOutlet,
        rating: fbRating,
        comment: fbComment,
        message: fbComment,
        visit_date: fbVisitDate || null
      });
    } catch {}

    const updatedFbHistory = [newFbItem, ...feedbackHistory];
    setFeedbackHistory(updatedFbHistory);
    try {
      localStorage.setItem(`mayflower_feedback_${user.id}`, JSON.stringify(updatedFbHistory));
    } catch {}

    const { data: profileData } = await supabase.from('user_profiles').select('reward_points,transactions').eq('id', user.id).single();
    const currentPts = Math.max(profileData?.reward_points ?? 0, user.rewardPoints ?? 0, customer?.loyalty_points ?? 0);
    const newPoints = currentPts + FEEDBACK_BONUS;

    const fbTx = {
      id: `feedback-${Date.now()}`,
      type: 'feedback_bonus',
      points: FEEDBACK_BONUS,
      description: `Points earned for feedback on ${fbOutlet}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    const updatedTx = [...(profileData?.transactions ?? user.transactions ?? []), fbTx];

    await supabase.from('user_profiles').update({
      reward_points: newPoints,
      transactions: updatedTx,
    }).eq('id', user.id);

    try {
      await supabase.from('customers').update({ loyalty_points: newPoints }).eq('user_id', user.id);
    } catch {}

    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        rewardPoints: newPoints,
        transactions: updatedTx,
      });
    }

    setSubmittingFb(false);
    showToast(`Feedback submitted! +${FEEDBACK_BONUS} points earned.`);
    setIsFeedbackOpen(false);
    setFbComment(''); setFbVisitDate(''); setFbRating(5);
    fetchAll();
  };

  const loyaltyPoints = Math.max(customer?.loyalty_points ?? 0, user.rewardPoints ?? 0);
  
  const getTierProgress = (points: number) => {
    if (points >= 2000) {
      return { tier: 'Sanctuary VIP', ptsToNext: 0, progress: 100, statusText: 'Highest VIP Tier Unlocked 👑' };
    }
    if (points >= 800) {
      const ptsToNext = 2000 - points;
      const progress = Math.min(100, Math.max(0, ((points - 800) / (2000 - 800)) * 100));
      return { tier: 'Gold', ptsToNext, progress, statusText: `${ptsToNext.toLocaleString()} pts to Sanctuary VIP` };
    }
    const ptsToNext = 800 - points;
    const progress = Math.min(100, Math.max(0, (points / 800) * 100));
    return { tier: 'Green', ptsToNext, progress, statusText: `${ptsToNext.toLocaleString()} pts to Gold Tier` };
  };

  const tierInfo = getTierProgress(loyaltyPoints);
  const loyaltyTier = customer?.loyalty_tier || tierInfo.tier;
  const totalVisits = customer?.total_visits ?? user.totalVisits ?? 0;

  // Merge DB reservations with user prop reservations
  const allReservations: ReservationRow[] = [...reservations];
  if (user.reservations) {
    const existingIds = new Set(reservations.map(r => r.id));
    user.reservations.forEach(ur => {
      if (!existingIds.has(ur.id)) {
        allReservations.push({
          id: ur.id,
          booking_code: ur.bookingCode,
          outlet: ur.outlet,
          reservation_date: ur.date,
          time_slot: ur.timeSlot,
          guests: ur.guests,
          status: ur.status,
          booked_at: ur.bookedAt,
          special_occasion: null,
          dietary_prefs: null,
        });
      }
    });
  }

  const upcomingRes = allReservations.filter(r => {
    const st = (r.status || '').toLowerCase();
    return st === 'confirmed' || st === 'pending';
  });
  const feedbackedOutlets = new Set(feedbackHistory.map(fb => fb.outlet).filter(Boolean));
  const availableOutlets = outlets.filter(o => !feedbackedOutlets.has(o.name));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user.name?.split(' ')[0] || 'Guest';

  if (showReservationWizard) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen text-[#1A1A1A]">
        <PlanYourVisit
          initialOutlet="Poes Garden"
          currentUser={user}
          onUpdateUser={onUpdateUser}
          onRequestSignIn={() => {}}
          onBackToWebsite={() => { setShowReservationWizard(false); fetchAll(); }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] font-sans selection:bg-[#C5A880] selection:text-black">
      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24">

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-[#1E3932] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-[#1E3932] uppercase tracking-[0.2em] font-serif">Loading Mayflower Guest Portal...</span>
            </div>
          </div>
        ) : (
          <>
            {/* ── Compact Horizontal Rectangular Banner ── */}
            <section className="bg-gradient-to-r from-[#02150c] via-[#152a20] to-[#02150c] border border-[#C5A880]/40 rounded-2xl p-5 sm:p-7 shadow-xl mb-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Left Side: Monogram, Greeting & Status */}
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full border border-[#C5A880] bg-[#02150c] text-[#C5A880] flex items-center justify-center font-serif text-xl font-bold shrink-0 shadow-[0_0_15px_rgba(197,168,128,0.25)]">
                  M
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-serif text-xl sm:text-2xl text-[#FAF7F2] font-bold tracking-tight">
                      {greeting}, {firstName}
                    </h1>
                    <span className="px-2.5 py-0.5 bg-[#152a20] text-[#C5A880] border border-[#C5A880]/40 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {loyaltyTier} Member
                    </span>
                  </div>
                  <p className="text-xs text-[#C5A880]/90 mt-1 font-sans">
                    Mayflower Patron since {user.joinedDate || '2026'} · {totalVisits} Visit{totalVisits !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Right Side: Compact Rectangular Stars Counter & Progress */}
              <div className="bg-[#02150c]/90 border border-[#C5A880]/40 rounded-xl p-3.5 px-5 flex items-center gap-5 shrink-0 shadow-lg w-full md:w-auto justify-between md:justify-start">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-[#C5A880]">
                    <span className="text-2xl sm:text-3xl font-bold font-serif leading-none drop-shadow-sm">
                      {loyaltyPoints.toLocaleString()}
                    </span>
                    <Star className="w-4 h-4 text-[#C5A880] fill-[#C5A880]" />
                  </div>
                  <span className="text-[9px] text-[#D1CDBC] uppercase tracking-[0.2em] font-semibold mt-0.5">Mayflower Stars</span>
                </div>

                <div className="w-36 sm:w-44 flex flex-col justify-center">
                  <div className="flex justify-between text-[10px] text-[#D1CDBC] mb-1 font-medium">
                    <span className="font-serif text-[#C5A880]">{loyaltyTier}</span>
                    <span className="text-gray-300 text-[9px] truncate max-w-[100px]">{tierInfo.statusText}</span>
                  </div>
                  <div className="h-2 bg-[#152a20] rounded-full overflow-hidden border border-[#C5A880]/30">
                    <div
                      className="h-full bg-gradient-to-r from-[#C5A880] via-[#E5C396] to-[#C5A880] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${tierInfo.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Quick Action Cards (High Contrast White Cards) ── */}
            <section className="grid grid-cols-2 gap-4 mb-10">
              <button
                onClick={() => setShowReservationWizard(true)}
                className="flex flex-col items-center gap-3 p-6 bg-white border border-[#E5E0D8] hover:border-[#C5A880] rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-[#1E3932] text-[#C5A880] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Utensils className="w-6 h-6" />
                </div>
                <span className="text-xs font-serif font-bold text-[#1E3932] uppercase tracking-wider">Reserve</span>
              </button>

              <button
                onClick={() => {
                  const opts = availableOutlets.length > 0 ? availableOutlets : (outlets.length > 0 ? outlets : DEFAULT_OUTLETS);
                  setIsFeedbackOpen(true);
                  setFbOutlet(opts[0]?.name ?? 'Poes Garden');
                }}
                className="flex flex-col items-center gap-3 p-6 bg-white border border-[#E5E0D8] hover:border-[#C5A880] rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-[#1E3932] text-[#C5A880] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Star className="w-6 h-6" />
                </div>
                <span className="text-xs font-serif font-bold text-[#1E3932] uppercase tracking-wider">Feedback</span>
              </button>
            </section>

            {/* ── Upcoming Reservations ── */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E3932] animate-pulse"></span>
                <h2 className="font-serif text-2xl text-[#1E3932] font-bold tracking-tight">Upcoming Reservations</h2>
              </div>

              {upcomingRes.length === 0 ? (
                <div className="bg-white border border-[#E5E0D8] rounded-2xl p-8 text-center shadow-sm">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">No upcoming reservations scheduled.</p>
                  <button onClick={() => setShowReservationWizard(true)} className="mt-4 text-xs font-bold text-[#1E3932] hover:text-[#C5A880] uppercase tracking-widest inline-flex items-center gap-1 cursor-pointer">
                    Book a Table Now <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {upcomingRes.map(r => (
                    <div key={r.id} className="bg-white border border-[#E5E0D8] hover:border-[#C5A880] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                      {modifyingId === r.id ? (
                        <div className="flex flex-col gap-4">
                          <span className="text-xs font-bold text-[#1E3932] uppercase tracking-wider">Modify Reservation Details</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</label>
                              <input type="date" value={modifyDate} min={new Date().toISOString().split('T')[0]} onChange={e => setModifyDate(e.target.value)}
                                className="h-10 bg-[#FAF7F2] text-[#1E3932] px-3 rounded-lg border border-[#E5E0D8] focus:outline-none focus:border-[#1E3932] text-xs" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Time Slot</label>
                              <select value={modifySlot} onChange={e => setModifySlot(e.target.value)}
                                className="h-10 bg-[#FAF7F2] text-[#1E3932] px-3 rounded-lg border border-[#E5E0D8] focus:outline-none focus:border-[#1E3932] text-xs cursor-pointer">
                                <option value="1:00 PM">Lunch – 1:00 PM</option>
                                <option value="7:30 PM">Dinner – 7:30 PM</option>
                                <option value="8:00 PM">Dinner – 8:00 PM</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Guests</label>
                              <select value={modifyGuests} onChange={e => setModifyGuests(e.target.value)}
                                className="h-10 bg-[#FAF7F2] text-[#1E3932] px-3 rounded-lg border border-[#E5E0D8] focus:outline-none focus:border-[#1E3932] text-xs cursor-pointer">
                                {[1,2,3,4,5,6,7,8,10].map(n => <option key={n} value={String(n)}>{n} Guests</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pt-2">
                            <button onClick={() => handleModifySave(r.id)} className="px-4 py-2 bg-[#1E3932] text-white font-bold rounded-lg text-xs uppercase tracking-wider cursor-pointer hover:bg-[#2A4C43] transition-colors">Save Changes</button>
                            <button onClick={() => setModifyingId(null)} className="px-4 py-2 text-gray-500 hover:text-black text-xs font-bold uppercase tracking-wider cursor-pointer">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-0.5 bg-[#1E3932] text-[#C5A880] text-[10px] font-bold uppercase tracking-wider rounded-full">
                                {r.status}
                              </span>
                              {r.booking_code && <span className="text-xs text-gray-400 font-mono">Ref: #{r.booking_code}</span>}
                            </div>
                            <h3 className="font-serif text-xl font-bold text-[#1E3932]">{r.outlet || 'The Mayflower, Chennai'}</h3>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#1E3932]" /> {r.reservation_date || '—'}</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#1E3932]" /> {r.time_slot || '—'}</span>
                              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#1E3932]" /> {r.guests || '—'} Guests</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setModifyingId(r.id); setModifyDate(r.reservation_date || ''); setModifySlot(r.time_slot || '7:30 PM'); setModifyGuests(String(r.guests || 2)); }}
                              className="px-3 py-1.5 bg-[#FAF7F2] text-[#1E3932] border border-[#E5E0D8] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#1E3932] hover:text-[#C5A880] cursor-pointer transition-colors"
                            >
                              Modify
                            </button>
                            <button
                              onClick={() => handleCancel(r.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-100 cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── My Reviews ── */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl text-[#1E3932] font-bold tracking-tight">My Reviews</h2>
                {availableOutlets.length > 0 && (
                  <button
                    onClick={() => { setIsFeedbackOpen(true); setFbOutlet(availableOutlets[0]?.name ?? ''); }}
                    className="px-3 py-1.5 bg-[#1E3932] text-[#C5A880] font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-[#2A4C43] cursor-pointer transition-colors"
                  >
                    + New Review
                  </button>
                )}
              </div>
              {feedbackHistory.length === 0 ? (
                <div className="bg-white border border-[#E5E0D8] rounded-2xl p-8 text-center shadow-sm">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">No dining reviews submitted yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {feedbackHistory.map(fb => (
                    <div key={fb.id} className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-serif font-bold text-[#1E3932]">{fb.outlet || 'Mayflower Outlet'}</span>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-4 h-4 ${s <= (fb.rating || 0) ? 'text-[#C5A880] fill-[#C5A880]' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed font-sans">{fb.comment}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">
                        {fb.visit_date ? `Visit: ${fb.visit_date} · ` : ''}{fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* ── Feedback Modal ── */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 relative text-[#1A1A1A]">
            <button onClick={() => setIsFeedbackOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer">
              ✕
            </button>
            <div>
              <span className="text-[10px] font-bold text-[#1E3932] uppercase tracking-[0.2em]">Share Your Experience</span>
              <h3 className="font-serif text-2xl text-[#1E3932] font-bold mt-1">Submit Dining Review</h3>
              <p className="text-xs text-gray-500 mt-1">Earn +{FEEDBACK_BONUS} Mayflower Stars for your review</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#1E3932] uppercase tracking-wider">Select Outlet</label>
                <select value={fbOutlet} onChange={e => setFbOutlet(e.target.value)}
                  className="w-full h-11 bg-[#FAF7F2] text-[#1E3932] px-4 rounded-lg border border-[#E5E0D8] focus:outline-none focus:border-[#1E3932] text-sm cursor-pointer">
                  {(availableOutlets.length > 0 ? availableOutlets : (outlets.length > 0 ? outlets : DEFAULT_OUTLETS)).map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#1E3932] uppercase tracking-wider">Rating</label>
                <div className="flex items-center gap-2 cursor-pointer">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} onClick={() => setFbRating(star)}
                      className={`w-7 h-7 transition-colors ${star <= fbRating ? 'text-[#C5A880] fill-[#C5A880]' : 'text-gray-300 hover:text-[#C5A880]'}`} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#1E3932] uppercase tracking-wider">Your Feedback</label>
                <textarea rows={3} value={fbComment} onChange={e => setFbComment(e.target.value)}
                  placeholder="Share details about food quality, ambiance, and service..."
                  className="w-full bg-[#FAF7F2] text-[#1E3932] p-3 rounded-lg border border-[#E5E0D8] focus:outline-none focus:border-[#1E3932] text-sm resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setIsFeedbackOpen(false)} className="px-4 py-2.5 text-gray-500 hover:text-black text-xs font-bold uppercase tracking-wider cursor-pointer">Cancel</button>
              <button onClick={handleSubmitFeedback} disabled={submittingFb}
                className="px-6 py-2.5 bg-[#1E3932] text-[#C5A880] font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-[#2A4C43] shadow-md cursor-pointer disabled:opacity-50 transition-colors">
                {submittingFb ? 'Submitting...' : 'Submit & Earn Stars'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast.show && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[10001] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-semibold ${toast.error ? 'bg-red-700 text-white' : 'bg-[#1E3932] text-[#C5A880]'}`}>
          {toast.error ? <AlertCircle className="w-5 h-5 text-white" /> : <CheckCircle className="w-5 h-5 text-[#C5A880]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Luxury Footer ── */}
      <footer className="bg-white border-t border-[#E5E0D8] py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span className="font-serif text-base text-[#1E3932] font-semibold">Mayflower Sanctuaries</span>
          <span>© {new Date().getFullYear()} Mayflower Hospitality Group India LLP</span>
        </div>
      </footer>
    </div>
  );
};
