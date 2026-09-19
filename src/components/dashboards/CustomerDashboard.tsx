import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UserProfile } from '../../types';
import { getDataProvider } from '../../data/DataProvider';
import { PlanYourVisit } from '../PlanYourVisit';

import { PatronProfile, Reservation, Review, SalonVenue, ReviewMemory } from './customer/types';
import { SALON_VENUES, INITIAL_REVIEWS } from './customer/initialData';
import { PatronCard } from './customer/PatronCard';
import { QuickActions } from './customer/QuickActions';
import { UpcomingReservations } from './customer/UpcomingReservations';
import { ExperienceShowcase } from './customer/ExperienceShowcase';
import { ReviewsSection } from './customer/ReviewsSection';
import { FeedbackModal } from './customer/FeedbackModal';
import { VenuesModal } from './customer/VenuesModal';
import { RewardsModal } from './customer/RewardsModal';
import { PatronProfileModal } from './customer/PatronProfileModal';
import { CancelModal } from './customer/CancelModal';
import { ModifyReservationModal } from './customer/ModifyReservationModal';
import { Toast, ToastMessage } from './customer/Toast';
import { Building2, PlusCircle, FileText } from 'lucide-react';
import { FranchiseEnquiryForm } from '../FranchiseEnquiryForm';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onOpenReservations?: () => void;
  onSwitchRole?: (role: string) => void;
  onUpdateUser?: (user: UserProfile) => void;
  onBackToWebsite?: () => void;
}

const RESERVATION_BONUS = 300;
const FEEDBACK_BONUS = 100;

const getVenueImage = (outletName: string): string => {
  const lower = (outletName || '').toLowerCase();
  if (lower.includes('poes')) {
    return 'https://lh3.googleusercontent.com/aida/AEtjO1Wo3D-NxlZuevsKxWUQc0PzydoS3peIKmiYY6QtnfINRqzJH02yMjS0jyQlLRrPcoks-ukpVd6K5xWLyyhHQfFjxQqZOa5nNWJDBuHYrJTu72nmEU_bCgxQC3pO96YcOrOBKTFu19K5R4fqScnrXH4aKPDEVBcylGJeaLUSEUSH_sHUoCntMrsXi7J-tSUZiq1jax_EwSzs4k4oDLdcrB_MwsYmDDYbVFyhMy_SpJiZyTGzd7-K2F880LY';
  }
  if (lower.includes('ecr') || lower.includes('palavakkam') || lower.includes('seaside')) {
    return 'https://lh3.googleusercontent.com/aida/AEtjO1XW-PaWkerRX2rvFgm1YiLEKzo5LKFtMeTwMs7UiL6mhBQmcC9lbh-mMmopPY6Axaih3QQJvZJLq-mdcjNJV0lkD6d0GM4CmajtbU08da42C-tGwMh2UFcISgk52hMt3mo_zpQFrrCoeVW39FSWDg2p0XyuSM7qlEXhXtrzfjy6H1eD4eEG7ew3t-eFhUYJh0ggjPCLpbdKF2q3uHm2oH1j2khFg7JFK4uzGYuZVS8tekVuTXpiceih4Bg';
  }
  return 'https://lh3.googleusercontent.com/aida/AEtjO1XKIlQBg8XDWITGCIcXI6RJC_RINGskS7HFz_6rq_LI4WMvZ3BqiEPW08_fkxqfIjyp5jsZ6zRJAQ-AEMHP_1XqncR6UGUOOwxqaichKeou8aGL_gWOj-ReFqc8Rru0UxozJi4PyVEXIbP9wypwYPJ_sIAfE5Bs9UTP0zRNll_fy8GZLCTUIbLaTxNp6pdyHqgO19bnaH6jWRVPydTBya32inEkSmbflUk207E_x8B_X8fPT_ukjEe1hXY';
};

const getSalonTag = (outletName: string): string => {
  const lower = (outletName || '').toLowerCase();
  if (lower.includes('poes')) return 'POES GARDEN SALON';
  if (lower.includes('ecr') || lower.includes('palavakkam')) return 'PALAVAKKAM ECR SEASIDE';
  if (lower.includes('flagship')) return 'FLAGSHIP GRAND SALON';
  return `${outletName.toUpperCase()} SALON`;
};

const getTierProgress = (points: number) => {
  if (points >= 2000) {
    return { tier: 'Sanctuary VIP', nextTier: 'Sanctuary VIP', ptsToNextTier: 0, maxTierStars: 2000 };
  }
  if (points >= 800) {
    return { tier: 'Gold', nextTier: 'Sanctuary VIP', ptsToNextTier: 2000 - points, maxTierStars: 2000 };
  }
  return { tier: 'Green', nextTier: 'Gold Tier', ptsToNextTier: 800 - points, maxTierStars: 800 };
};

export const CustomerDashboard: React.FC<Props> = ({
  user,
  onLogout: _onLogout,
  onOpenReservations: _onOpenReservations,
  onSwitchRole: _onSwitchRole,
  onUpdateUser,
  onBackToWebsite: _onBackToWebsite,
}) => {
  // Use older dashboard reservation wizard (PlanYourVisit)
  const [showReservationWizard, setShowReservationWizard] = useState(false);
  const [targetOutlet, setTargetOutlet] = useState('Poes Garden');

  // Patron Profile State
  const initialTierInfo = getTierProgress(user.rewardPoints || 600);
  const [patron, setPatron] = useState<PatronProfile>({
    name: user.name || 'Patron',
    monogram: (user.name?.[0] || 'M').toUpperCase(),
    tier: (user.tier as any) || initialTierInfo.tier,
    stars: user.rewardPoints ?? 600,
    maxTierStars: initialTierInfo.maxTierStars,
    nextTier: initialTierInfo.nextTier,
    ptsToNextTier: initialTierInfo.ptsToNextTier,
    memberSince: user.joinedDate || '14 Sept 2026',
    totalVisits: user.totalVisits ?? 0,
    dietaryPreferences: ['Truffle Degustation', 'Sparkling Mineral Water', 'No Shellfish'],
    preferredSeating: 'Quiet corner or Verandah booth',
  });

  // Reservations State
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(`mayflower_reviews_${user.id}`);
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [venues] = useState<SalonVenue[]>(SALON_VENUES);

  // Modals visibility
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isVenuesOpen, setIsVenuesOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cancelingReservation, setCancelingReservation] = useState<Reservation | null>(null);
  const [modifyingReservation, setModifyingReservation] = useState<Reservation | null>(null);
  const [isFranchiseModalOpen, setIsFranchiseModalOpen] = useState(false);
  const [franchiseEnquiries, setFranchiseEnquiries] = useState<any[]>([]);

  // Notification Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (title: string, message: string) => {
    const id = Date.now().toString();
    setToast({ id, title, message });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 5000);
  };

  const fetchAll = useCallback(async () => {
    try {
      const provider = getDataProvider();
      const [providerRes, providerFb, myFranchises] = await Promise.all([
        provider.getReservations(user).catch(() => []),
        provider.getFeedback(user).catch(() => []),
        provider.getMyFranchiseEnquiries ? provider.getMyFranchiseEnquiries(user).catch(() => []) : Promise.resolve([]),
      ]);
      setFranchiseEnquiries(myFranchises || []);

      // Fetch customer row for preferences
      try {
        const custRes = await supabase
          .from('customers')
          .select('dietary_preferences,allergies,preferred_seating,total_visits,loyalty_tier,loyalty_points')
          .eq('user_id', user.id)
          .maybeSingle();

        if (custRes?.data) {
          const c = custRes.data;
          const currentStars = Math.max(c.loyalty_points ?? 0, user.rewardPoints ?? 0);
          const tInfo = getTierProgress(currentStars);
          setPatron((prev) => ({
            ...prev,
            stars: currentStars,
            tier: c.loyalty_tier || tInfo.tier,
            nextTier: tInfo.nextTier,
            ptsToNextTier: tInfo.ptsToNextTier,
            maxTierStars: tInfo.maxTierStars,
            totalVisits: c.total_visits ?? prev.totalVisits,
            dietaryPreferences: c.dietary_preferences || prev.dietaryPreferences,
            preferredSeating: c.preferred_seating || prev.preferredSeating,
          }));
        }
      } catch {}

      // Map reservations
      let mappedReservations: Reservation[] = [];
      if (providerRes && providerRes.length > 0) {
        mappedReservations = providerRes.map((r: any) => {
          const outletName = r.outlet || 'Poes Garden';
          return {
            id: r.id,
            ref: r.bookingCode ? `#${r.bookingCode}` : `#MF-${r.id.slice(-4)}`,
            salon: outletName,
            salonTag: getSalonTag(outletName),
            date: r.date || '—',
            time: r.timeSlot || '—',
            experienceType: (r.timeSlot || '').toLowerCase().includes('tea') ? 'Afternoon Tea' : 'Fine Dining Tasting',
            guests: r.guests || 2,
            status: ((r.status || 'CONFIRMED').toUpperCase() as any),
            imageUrl: getVenueImage(outletName),
            notes: r.specialRequests || undefined,
          };
        });
      } else {
        const { data: resData } = await supabase
          .from('reservations')
          .select('id,booking_code,reservation_date,time_slot,reservation_time,party_size,guests,status,special_occasion,special_requests,outlets(name)')
          .eq('customer_id', user.id)
          .order('reservation_date', { ascending: false });

        if (resData && resData.length > 0) {
          mappedReservations = (resData as any[]).map((r) => {
            const outletName = r.outlets?.name || 'Poes Garden';
            const timeVal = r.time_slot || r.reservation_time || '7:30 PM';
            return {
              id: r.id,
              ref: r.booking_code ? `#${r.booking_code}` : `#MF-${r.id.slice(-4)}`,
              salon: outletName,
              salonTag: getSalonTag(outletName),
              date: r.reservation_date || '—',
              time: timeVal,
              experienceType: timeVal.toLowerCase().includes('tea') ? 'Afternoon Tea' : 'Fine Dining Tasting',
              guests: r.guests || r.party_size || 2,
              status: ((r.status || 'CONFIRMED').toUpperCase() as any),
              imageUrl: getVenueImage(outletName),
              notes: r.special_occasion || r.special_requests || undefined,
            };
          });
        }
      }

      // Merge user prop reservations if any not included
      if (user.reservations) {
        const existingIds = new Set(mappedReservations.map((r) => r.id));
        user.reservations.forEach((ur) => {
          if (!existingIds.has(ur.id)) {
            const outletName = ur.outlet || 'Poes Garden';
            mappedReservations.push({
              id: ur.id,
              ref: ur.bookingCode ? `#${ur.bookingCode}` : `#MF-${ur.id.slice(-4)}`,
              salon: outletName,
              salonTag: getSalonTag(outletName),
              date: ur.date || '—',
              time: ur.timeSlot || '—',
              experienceType: (ur.timeSlot || '').toLowerCase().includes('tea') ? 'Afternoon Tea' : 'Fine Dining Tasting',
              guests: ur.guests || 2,
              status: ((ur.status || 'CONFIRMED').toUpperCase() as any),
              imageUrl: getVenueImage(outletName),
            });
          }
        });
      }

      setReservations(mappedReservations);

      // Map feedback
      const dbReviews: Review[] = providerFb.map((f: any) => ({
        id: f.id,
        salon: f.outlet || 'Poes Garden Salon',
        rating: f.rating || 5,
        text: f.comment || f.message || 'Exceptional experience.',
        visitDate: f.visitDate || 'Recent Visit',
        formattedDate: f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-IN') : '',
        isVerified: true,
      }));

      if (dbReviews.length > 0) {
        setReviews(dbReviews);
      }
    } catch {
      // Fallback gracefully
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Sync reviews to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`mayflower_reviews_${user.id}`, JSON.stringify(reviews));
    } catch {}
  }, [reviews, user.id]);

  // Listen for profile open events from the unified top bar
  useEffect(() => {
    const handleOpenProfileEvent = () => setIsProfileOpen(true);
    window.addEventListener('open-patron-profile', handleOpenProfileEvent);
    return () => window.removeEventListener('open-patron-profile', handleOpenProfileEvent);
  }, []);

  // Handle opening older reservation wizard (PlanYourVisit)
  const handleOpenReserve = (venueName?: string) => {
    if (venueName) {
      setTargetOutlet(venueName.replace(' Salon', ''));
    } else {
      setTargetOutlet('Poes Garden');
    }
    setShowReservationWizard(true);
  };

  // Handle modifying reservation
  const handleModifyReservation = (reservation: Reservation) => {
    setModifyingReservation(reservation);
  };

  const handleSaveModifiedReservation = async (
    reservationId: string,
    updatedData: { date: string; time: string; guests: number; notes?: string }
  ) => {
    try {
      const updates: Record<string, any> = {
        reservation_date: updatedData.date,
        time_slot: updatedData.time,
        guests: updatedData.guests,
      };
      if (updatedData.notes) updates.special_occasion = updatedData.notes;

      await supabase
        .from('reservations')
        .update(updates)
        .eq('id', reservationId)
        .eq('customer_id', user.id);

      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationId
            ? {
                ...r,
                date: updatedData.date,
                time: updatedData.time,
                guests: updatedData.guests,
                notes: updatedData.notes,
              }
            : r
        )
      );

      showToast(
        'Reservation Updated',
        `Your reservation has been updated for ${updatedData.date} at ${updatedData.time}.`
      );
      fetchAll();
    } catch {
      showToast('Update Failed', 'Could not update reservation. Please try again.');
    }
  };

  // Handle cancelling reservation
  const handleConfirmCancel = async (reservationId: string) => {
    try {
      await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId)
        .eq('customer_id', user.id);

      // Deduct loyalty points if applicable
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('reward_points,transactions')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        const cancelTx = {
          id: `cancel-${reservationId}`,
          type: 'cancelled_reservation',
          points: -RESERVATION_BONUS,
          description: 'Points deducted for cancelled reservation',
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        };
        const newPoints = Math.max(0, (profileData.reward_points ?? 0) - RESERVATION_BONUS);
        await supabase
          .from('user_profiles')
          .update({
            reward_points: newPoints,
            transactions: [...(profileData.transactions ?? []), cancelTx],
          })
          .eq('id', user.id);

        try {
          await supabase.from('customers').update({ loyalty_points: newPoints }).eq('user_id', user.id);
        } catch {}

        const tInfo = getTierProgress(newPoints);
        setPatron((prev) => ({
          ...prev,
          stars: newPoints,
          tier: tInfo.tier,
          nextTier: tInfo.nextTier,
          ptsToNextTier: tInfo.ptsToNextTier,
        }));

        if (onUpdateUser) {
          onUpdateUser({
            ...user,
            rewardPoints: newPoints,
          });
        }
      }

      setReservations((prev) => prev.filter((r) => r.id !== reservationId));
      showToast(
        'Reservation Cancelled',
        'Your salon table booking has been released.'
      );
      fetchAll();
    } catch {
      showToast('Cancellation Failed', 'Could not cancel reservation.');
    }
  };

  // Handle submitting feedback
  const handleSubmitFeedback = async (feedback: {
    salon: string;
    experienceType: string;
    rating: number;
    notes: string;
    attachedMemory?: ReviewMemory;
  }) => {
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const visitDateStr = `${today.getDate()} ${today.toLocaleString('en-US', { month: 'short' })} ${today.getFullYear()}`;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      salon: feedback.salon,
      rating: feedback.rating,
      text: feedback.notes,
      visitDate: visitDateStr,
      formattedDate: formattedDate,
      isVerified: true,
      attachedMemory: feedback.attachedMemory,
    };

    setReviews((prev) => [newReview, ...prev]);

    // Calculate awarded stars
    const bonusAwarded = FEEDBACK_BONUS + (feedback.attachedMemory ? 50 : 0);
    const newPoints = patron.stars + bonusAwarded;
    const newVisits = patron.totalVisits + 1;
    const tInfo = getTierProgress(newPoints);

    setPatron((prev) => ({
      ...prev,
      stars: newPoints,
      tier: tInfo.tier,
      nextTier: tInfo.nextTier,
      ptsToNextTier: tInfo.ptsToNextTier,
      totalVisits: newVisits,
    }));

    // Update Supabase feedback & profile
    try {
      await supabase.from('feedback').insert({
        user_id: user.id,
        customer_id: user.id,
        outlet: feedback.salon,
        rating: feedback.rating,
        comment: feedback.notes,
        message: feedback.notes,
        visit_date: visitDateStr,
      });

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('reward_points,transactions')
        .eq('id', user.id)
        .maybeSingle();

      const fbTx = {
        id: `feedback-${Date.now()}`,
        type: 'feedback_bonus',
        points: bonusAwarded,
        description: `Points earned for feedback on ${feedback.salon}`,
        date: formattedDate,
      };

      const updatedTx = [...(profileData?.transactions ?? user.transactions ?? []), fbTx];

      await supabase.from('user_profiles').update({
        reward_points: newPoints,
        total_visits: newVisits,
        transactions: updatedTx,
      }).eq('id', user.id);

      try {
        await supabase.from('customers').update({
          loyalty_points: newPoints,
          total_visits: newVisits,
        }).eq('user_id', user.id);
      } catch {}

      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          rewardPoints: newPoints,
          totalVisits: newVisits,
          transactions: updatedTx,
        });
      }
    } catch {}

    showToast(
      'Patron Relations Confirmed',
      `Thank you for your feedback, ${patron.name}. +${bonusAwarded} Mayflower Stars awarded.`
    );
  };

  // Handle updating patron preferences
  const handleUpdatePatron = async (updated: Partial<PatronProfile>) => {
    setPatron((prev) => ({ ...prev, ...updated }));

    try {
      await supabase
        .from('customers')
        .update({
          dietary_preferences: updated.dietaryPreferences,
          preferred_seating: updated.preferredSeating,
        })
        .eq('user_id', user.id);
    } catch {}

    showToast('Preferences Saved', 'Your dining and seating preferences have been noted for upcoming visits.');
  };

  // IF USER IS MAKING A RESERVATION: RENDER OLDER DASHBOARD RESERVATION SYSTEM (PlanYourVisit)
  if (showReservationWizard) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen text-[#1A1A1A]">
        <PlanYourVisit
          initialOutlet={targetOutlet}
          currentUser={user}
          onUpdateUser={(updated) => {
            onUpdateUser?.(updated);
          }}
          onRequestSignIn={() => {}}
          onBackToWebsite={() => {
            setShowReservationWizard(false);
            fetchAll();
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] text-stone-800 font-sans min-h-screen flex flex-col antialiased selection:bg-[#C5A880]/25 selection:text-[#081C15]">
      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-7 sm:py-9 space-y-7 sm:space-y-9">
        {/* Patron Membership Card */}
        <PatronCard
          patron={patron}
          onOpenRewards={() => setIsRewardsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Quick Actions Grid */}
        <QuickActions
          onOpenReserve={() => handleOpenReserve()}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />

        {/* Upcoming Reservations */}
        <UpcomingReservations
          reservations={reservations}
          onModify={handleModifyReservation}
          onCancel={(res) => setCancelingReservation(res)}
          onNewReservation={() => handleOpenReserve()}
        />

        {/* Atmosphere Showcase */}
        <ExperienceShowcase onExploreVenues={() => setIsVenuesOpen(true)} />

        {/* Franchise Partnership Tracking Section */}
        <section className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8E2D5]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D4030]/10 flex items-center justify-center text-[#2D4030]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1A1A1A]">Franchise Partnership Tracking</h3>
                <p className="text-xs text-stone-500">Track status of your Mayflower Sanctuary franchise applications</p>
              </div>
            </div>
            <button
              onClick={() => setIsFranchiseModalOpen(true)}
              className="px-4 py-2 bg-[#2D4030] hover:bg-[#1F3022] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Apply for Franchise</span>
            </button>
          </div>

          <div className="mt-5">
            {franchiseEnquiries.length === 0 ? (
              <div className="text-center py-8 px-4 bg-[#FAF7F2] rounded-xl border border-dashed border-[#E8E2D5]">
                <Building2 className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-stone-700">No active franchise applications</p>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Interested in bringing The Mayflower dining sanctuary to your city? Submit an enquiry to get started.
                </p>
                <button
                  onClick={() => setIsFranchiseModalOpen(true)}
                  className="mt-4 px-4 py-2 border border-[#2D4030] text-[#2D4030] hover:bg-[#2D4030] hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Submit Franchise Enquiry
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {franchiseEnquiries.map((enq: any) => {
                  const statusColors: Record<string, string> = {
                    'New': 'bg-stone-100 text-stone-700 border-stone-300',
                    'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
                    'Contacted': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Qualified': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'Closed': 'bg-rose-50 text-rose-700 border-rose-200',
                  };
                  return (
                    <div key={enq.id} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#1A1A1A]">{enq.cityInterested || 'Chennai'} Sanctuary</span>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${statusColors[enq.status] || 'bg-stone-100 text-stone-700'}`}>
                            {enq.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Budget: <span className="font-medium text-stone-700">{enq.investmentBudget || '₹1.5 Cr – ₹2.5 Cr'}</span> · Submitted on {enq.createdAt}
                        </p>
                        {enq.documents && enq.documents.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-[11px] text-stone-400">Attached Documents:</span>
                            {enq.documents.map((doc: any, i: number) => (
                              <span key={i} className="inline-flex items-center text-[10px] bg-white px-2 py-0.5 rounded border border-[#E8E2D5] text-stone-600">
                                <FileText className="w-3 h-3 mr-1 text-[#2D4030]" />
                                {doc.fileName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-stone-400 block">Current Stage</span>
                        <span className="text-xs font-semibold text-[#2D4030]">
                          {enq.status === 'New' && 'Application Received'}
                          {enq.status === 'Under Review' && 'Operations Team Reviewing'}
                          {enq.status === 'Contacted' && 'Discussion In Progress'}
                          {enq.status === 'Qualified' && 'Approved for Onboarding'}
                          {enq.status === 'Closed' && 'Enquiry Completed'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* My Reviews */}
        <ReviewsSection
          reviews={reviews}
          onOpenNewReview={() => setIsFeedbackOpen(true)}
        />
      </main>

      {/* Luxury Heritage Footer */}
      <footer className="border-t border-[#E8E2D5] bg-[#FAF7F2] py-6 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-serif italic text-stone-600">
            The MayFlower Salons &amp; Private Dining · British Heritage Fine Dining
          </p>
          <p className="text-[11px] text-stone-400">
            Concierge Desk: reservations@mayflower-heritage.com · +91 44 2811 4000
          </p>
        </div>
      </footer>

      {/* Modals */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        patron={patron}
        onSubmit={handleSubmitFeedback}
      />

      <VenuesModal
        isOpen={isVenuesOpen}
        onClose={() => setIsVenuesOpen(false)}
        venues={venues}
        onSelectVenueToReserve={(venueName) => {
          setIsVenuesOpen(false);
          handleOpenReserve(venueName);
        }}
      />

      <RewardsModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        patron={patron}
      />

      <PatronProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        patron={patron}
        onUpdatePatron={handleUpdatePatron}
      />

      <CancelModal
        isOpen={!!cancelingReservation}
        onClose={() => setCancelingReservation(null)}
        reservation={cancelingReservation}
        onConfirmCancel={handleConfirmCancel}
      />

      <ModifyReservationModal
        isOpen={!!modifyingReservation}
        onClose={() => setModifyingReservation(null)}
        reservation={modifyingReservation}
        onSaveModifiedReservation={handleSaveModifiedReservation}
      />

      {isFranchiseModalOpen && (
        <FranchiseEnquiryForm
          user={user}
          onClose={() => setIsFranchiseModalOpen(false)}
          onSuccess={() => {
            setIsFranchiseModalOpen(false);
            fetchAll();
          }}
        />
      )}

      {/* Confirmation Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};
