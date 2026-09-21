import { PatronProfile, Reservation, Review, SalonVenue } from './types';

export const INITIAL_PATRON: PatronProfile = {
  name: 'Madan',
  monogram: 'M',
  tier: 'Green',
  stars: 600,
  maxTierStars: 1000,
  nextTier: 'Gold Tier',
  ptsToNextTier: 200,
  memberSince: '14 Sept 2026',
  totalVisits: 0,
  dietaryPreferences: ['Truffle Degustation', 'Sparkling Mineral Water', 'No Shellfish'],
  preferredSeating: 'Quiet corner or Verandah booth',
};

export const SALON_VENUES: SalonVenue[] = [
  {
    id: 'poes-garden',
    name: 'Poes Garden',
    tag: 'POES GARDEN',
    location: '17, Kasturi Rangan Rd, Poes Garden, Alwarpet, Chennai',
    headline: 'Garden Cafe & Glasshouse Dining',
    description: 'Our flagship cafe in Poes Garden under lush shade trees. Features an airy glass conservatory, leafy open courtyard, artisanal coffee, and comforting global cafe dishes.',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    timing: '11:00 AM – 11:00 PM (Daily)',
    highlights: ['Glasshouse Seating', 'Valet Parking', 'Outdoor Courtyard', 'Pet Friendly'],
  },
  {
    id: 'palavakkam-ecr',
    name: 'Palavakkam (ECR)',
    tag: 'PALAVAKKAM (ECR)',
    location: '28, MGR Salai, Palavakkam, Chennai',
    headline: 'Breezy Seaside Courtyard & Wood-Fired Cafe',
    description: 'Located along MGR Salai, Palavakkam, this beachside cafe offers breezy palm-shaded outdoor seating, fresh wood-fired sourdough pizzas, and specialty brews.',
    imageUrl: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80',
    timing: '11:00 AM – 11:00 PM (Daily)',
    highlights: ['Beach Breeze', 'Outdoor Cabanas', 'Wood-Fired Pizza', 'Ample Parking'],
  },
  {
    id: 'egmore',
    name: 'Egmore',
    tag: 'EGMORE',
    location: '57, Gandhi Irwin Road, Egmore, Chennai',
    headline: 'Art District Cafe & Espresso Bar',
    description: 'A bright, high-ceilinged cafe on Gandhi Irwin Road. Combines freshly brewed coffees and delicious food with warm wooden tables, quiet study nooks, and local art.',
    imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80',
    timing: '11:00 AM – 11:00 PM (Daily)',
    highlights: ['Fresh Coffee Bar', 'Quiet Study Tables', 'Art Gallery Wall', 'Wheelchair Friendly'],
  },
  {
    id: 'anna-nagar',
    name: 'Anna Nagar',
    tag: 'ANNA NAGAR',
    location: 'J9, 6th Ave, J Block, Annanagar East, Chennai',
    headline: 'Spacious Two-Level Cafe & Open Terrace',
    description: 'A two-story cafe with hanging plants, natural sunlight, and a breezy open terrace in Annanagar East. Perfect for family lunches and celebratory catch-ups.',
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    timing: '11:00 AM – 11:00 PM (Daily)',
    highlights: ['Open Terrace', 'Private Mezzanine', 'Group Dining', 'Dessert Counter'],
  },
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    ref: '#MF-2996',
    salon: 'Poes Garden',
    salonTag: 'POES GARDEN',
    date: '2026-09-14',
    time: '4:00 PM (Afternoon Tea)',
    experienceType: 'Afternoon Tea',
    guests: 2,
    status: 'CONFIRMED',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    notes: 'Window table near botanical garden requested.',
    sommelierPairing: false,
  },
];

export const INITIAL_REVIEWS: Review[] = [];

