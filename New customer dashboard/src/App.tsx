/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PatronProfile, Reservation, Review, SalonVenue } from './types';
import {
  INITIAL_PATRON,
  INITIAL_RESERVATIONS,
  INITIAL_REVIEWS,
  SALON_VENUES,
} from './data/initialData';
import { Header } from './components/Header';
import { PatronCard } from './components/PatronCard';
import { QuickActions } from './components/QuickActions';
import { UpcomingReservations } from './components/UpcomingReservations';
import { ExperienceShowcase } from './components/ExperienceShowcase';
import { ReviewsSection } from './components/ReviewsSection';
import { FeedbackModal } from './components/FeedbackModal';
import { ReservationModal } from './components/ReservationModal';
import { VenuesModal } from './components/VenuesModal';
import { RewardsModal } from './components/RewardsModal';
import { PatronProfileModal } from './components/PatronProfileModal';
import { CancelModal } from './components/CancelModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  // Persistence with localStorage fallback
  const [patron, setPatron] = useState<PatronProfile>(() => {
    try {
      const saved = localStorage.getItem('mayflower_patron');
      return saved ? JSON.parse(saved) : INITIAL_PATRON;
    } catch {
      return INITIAL_PATRON;
    }
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem('mayflower_reservations');
      return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
    } catch {
      return INITIAL_RESERVATIONS;
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('mayflower_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [venues] = useState<SalonVenue[]>(SALON_VENUES);

  // Modal visibility states
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [preselectedVenueId, setPreselectedVenueId] = useState<string | undefined>();

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isVenuesOpen, setIsVenuesOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cancelingReservation, setCancelingReservation] = useState<Reservation | null>(null);

  // Notification Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('mayflower_patron', JSON.stringify(patron));
    } catch (err) {
      console.warn('Failed to save patron to localStorage', err);
    }
  }, [patron]);

  useEffect(() => {
    try {
      localStorage.setItem('mayflower_reservations', JSON.stringify(reservations));
    } catch (err) {
      console.warn('Failed to save reservations to localStorage', err);
    }
  }, [reservations]);

  useEffect(() => {
    try {
      localStorage.setItem('mayflower_reviews', JSON.stringify(reviews));
    } catch (err) {
      console.warn('Failed to save reviews to localStorage', err);
    }
  }, [reviews]);

  const showToast = (title: string, message: string) => {
    const id = Date.now().toString();
    setToast({ id, title, message });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 5500);
  };

  // Handlers
  const handleOpenReserveNew = (venueId?: string) => {
    setEditingReservation(null);
    setPreselectedVenueId(venueId);
    setIsReserveOpen(true);
  };

  const handleModifyReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setPreselectedVenueId(undefined);
    setIsReserveOpen(true);
  };

  const handleSaveReservation = (
    resData: Omit<Reservation, 'id'>,
    idToUpdate?: string
  ) => {
    if (idToUpdate) {
      // Modification
      setReservations((prev) =>
        prev.map((r) => (r.id === idToUpdate ? { ...resData, id: idToUpdate } : r))
      );
      showToast(
        'Reservation Updated',
        `Your reservation at ${resData.salon} (${resData.ref}) has been updated for ${resData.date}.`
      );
    } else {
      // New Reservation
      const newRes: Reservation = {
        ...resData,
        id: `res-${Date.now()}`,
      };
      setReservations((prev) => [newRes, ...prev]);

      // Award bonus stars
      const bonusStars = resData.sommelierPairing ? 150 : 50;
      setPatron((prev) => ({
        ...prev,
        stars: prev.stars + bonusStars,
        ptsToNextTier: Math.max(0, prev.ptsToNextTier - bonusStars),
      }));

      showToast(
        'Table Reserved',
        `Table confirmed at ${resData.salon} for ${resData.date}. Ref: ${resData.ref}. +${bonusStars} Mayflower Stars awarded.`
      );
    }
  };

  const handleConfirmCancel = (reservationId: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== reservationId));
    showToast(
      'Reservation Cancelled',
      'Your salon table booking has been gracefully cancelled with no cancellation fee.'
    );
  };

  const handleSubmitFeedback = (feedback: {
    salon: string;
    experienceType: string;
    rating: number;
    notes: string;
    attachedMemory?: { title: string; subtitle: string; imageUrl: string };
  }) => {
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const visitDateStr = `${today.getDate()} Sept ${today.getFullYear()}`;

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

    // Add stars & update visits
    setPatron((prev) => ({
      ...prev,
      stars: prev.stars + 50,
      ptsToNextTier: Math.max(0, prev.ptsToNextTier - 50),
      totalVisits: prev.totalVisits + 1,
    }));

    showToast(
      'Patron Relations Confirmed',
      `Thank you for your feedback, ${patron.name}. Your dining experience honors our heritage.`
    );
  };

  const handleUpdatePatron = (updated: Partial<PatronProfile>) => {
    setPatron((prev) => ({ ...prev, ...updated }));
    showToast('Preferences Saved', 'Your dining and seating preferences have been noted for upcoming visits.');
  };

  const handleResetToHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('MayFlower Salons', `Welcome back to your patron dashboard, ${patron.name}.`);
  };

  return (
    <div className="bg-[#FAF7F2] text-stone-800 font-sans min-h-screen flex flex-col antialiased selection:bg-[#C5A880]/25 selection:text-[#081C15]">
      {/* Top Navigation */}
      <Header
        patron={patron}
        onOpenProfile={() => setIsProfileOpen(true)}
        onResetView={handleResetToHome}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-7 sm:py-9 space-y-7 sm:space-y-9">
        {/* Patron Membership Card */}
        <PatronCard patron={patron} onOpenRewards={() => setIsRewardsOpen(true)} />

        {/* Quick Actions Grid */}
        <QuickActions
          onOpenReserve={() => handleOpenReserveNew()}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />

        {/* Upcoming Reservations */}
        <UpcomingReservations
          reservations={reservations}
          onModify={handleModifyReservation}
          onCancel={(res) => setCancelingReservation(res)}
          onNewReservation={() => handleOpenReserveNew()}
        />

        {/* Atmosphere Showcase */}
        <ExperienceShowcase onExploreVenues={() => setIsVenuesOpen(true)} />

        {/* My Reviews */}
        <ReviewsSection
          reviews={reviews}
          onOpenNewReview={() => setIsFeedbackOpen(true)}
        />
      </main>

      {/* Footer */}
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

      <ReservationModal
        isOpen={isReserveOpen}
        onClose={() => {
          setIsReserveOpen(false);
          setEditingReservation(null);
          setPreselectedVenueId(undefined);
        }}
        venues={venues}
        editingReservation={editingReservation}
        onSaveReservation={handleSaveReservation}
        preselectedVenueId={preselectedVenueId}
      />

      <VenuesModal
        isOpen={isVenuesOpen}
        onClose={() => setIsVenuesOpen(false)}
        venues={venues}
        onSelectVenueToReserve={(venueId) => {
          setIsVenuesOpen(false);
          handleOpenReserveNew(venueId);
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

      {/* Confirmation Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
