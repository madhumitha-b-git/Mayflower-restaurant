export interface PatronProfile {
  name: string;
  monogram: string;
  tier: 'Green' | 'Gold' | 'Black Diamond' | string;
  stars: number;
  maxTierStars: number;
  nextTier: string;
  ptsToNextTier: number;
  memberSince: string;
  totalVisits: number;
  dietaryPreferences?: string[];
  preferredSeating?: string;
}

export interface Reservation {
  id: string;
  ref: string;
  salon: string;
  salonTag: string;
  date: string;
  time: string;
  experienceType: string;
  guests: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'SEATED' | 'COMPLETED';
  imageUrl: string;
  notes?: string;
  sommelierPairing?: boolean;
  assignedTable?: string;
}

export interface ReviewMemory {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface Review {
  id: string;
  salon: string;
  rating: number;
  text: string;
  visitDate: string;
  formattedDate: string;
  isVerified: boolean;
  attachedMemory?: ReviewMemory;
}

export interface SalonVenue {
  id: string;
  name: string;
  tag: string;
  location: string;
  headline: string;
  description: string;
  imageUrl: string;
  timing: string;
  dressCode: string;
  signatureOfferings: string[];
}
