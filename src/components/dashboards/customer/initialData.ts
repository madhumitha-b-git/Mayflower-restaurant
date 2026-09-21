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
    location: '3, Khader Nawaz Khan Rd, Poes Garden, Chennai',
    headline: 'Traditional Afternoon Tea & Colonial Verandah Salon',
    description: 'An oasis of tranquility surrounded by manicured botanical palms. Renowned for authentic English scones with clotted cream, vintage silver service teas, and artisanal savory finger sandwiches.',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1Wo3D-NxlZuevsKxWUQc0PzydoS3peIKmiYY6QtnfINRqzJH02yMjS0jyQlLRrPcoks-ukpVd6K5xWLyyhHQfFjxQqZOa5nNWJDBuHYrJTu72nmEU_bCgxQC3pO96YcOrOBKTFu19K5R4fqScnrXH4aKPDEVBcylGJeaLUSEUSH_sHUoCntMrsXi7J-tSUZiq1jax_EwSzs4k4oDLdcrB_MwsYmDDYbVFyhMy_SpJiZyTGzd7-K2F880LY',
    timing: '11:00 AM – 11:00 PM (High Tea & Verandah Dining)',
    dressCode: 'Smart Casual / Elegant Daywear',
    signatureOfferings: ['Rare Single-Estate Darjeeling 1st Flush', 'Devonshire Clotted Cream Scones', 'Smoked Salmon & Caviar Blinis'],
  },
  {
    id: 'palavakkam-ecr',
    name: 'Palavakkam (ECR)',
    tag: 'PALAVAKKAM (ECR)',
    location: 'ECR, Palavakkam, Chennai',
    headline: 'Candlelit Oceanfront Terrace & Coastal Wood-Fired Grill',
    description: 'Where the gentle rhythm of the Bay of Bengal meets Michelin-standard culinary art. Candlelit oceanfront terrace tables, catch of the day cured tableside, and sunset champagne aperitifs.',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1XW-PaWkerRX2rvFgm1YiLEKzo5LKFtMeTwMs7UiL6mhBQmcC9lbh-mMmopPY6Axaih3QQJvZJLq-mdcjNJV0lkD6d0GM4CmajtbU08da42C-tGwMh2UFcISgk52hMt3mo_zpQFrrCoeVW39FSWDg2p0XyuSM7qlEXhXtrzfjy6H1eD4eEG7ew3t-eFhUYJh0ggjPCLpbdKF2q3uHm2oH1j2khFg7JFK4uzGYuZVS8tekVuTXpiceih4Bg',
    timing: '12:00 PM – 11:00 PM (Sunset Aperitifs & Oceanfront Dinner)',
    dressCode: 'Resort Elegant / Smart Casual',
    signatureOfferings: ['Fresh Sea Bass Ceviche with Finger Lime', 'Charred Butter-Poached Rock Lobster', 'Sunset Reserve Rosé Flight'],
  },
  {
    id: 'egmore',
    name: 'Egmore',
    tag: 'EGMORE',
    location: 'Egmore, Chennai',
    headline: 'Colonial Heritage Manor & Bespoke Fine Dining Cellar',
    description: 'Rich heritage architecture featuring cathedral-height coffered ceilings, Venetian chandeliers, velvet banquettes, and an underground sommelier cellar.',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1XKIlQBg8XDWITGCIcXI6RJC_RINGskS7HFz_6rq_LI4WMvZ3BqiEPW08_fkxqfIjyp5jsZ6zRJAQ-AEMHP_1XqncR6UGUOOwxqaichKeou8aGL_gWOj-ReFqc8Rru0UxozJi4PyVEXIbP9wypwYPJ_sIAfE5Bs9UTP0zRNll_fy8GZLCTUIbLaTxNp6pdyHqgO19bnaH6jWRVPydTBya32inEkSmbflUk207E_x8B_X8fPT_ukjEe1hXY',
    timing: '12:00 PM – 11:00 PM (Dinner & Cellar Tastings)',
    dressCode: 'Formal / Jacket Required for Gentlemen',
    signatureOfferings: ['7-Course Sovereign Tasting Menu', 'Wagyu Beef Wellington with Truffle Jus', 'Rare Bordeaux & Vintage Champagne Pairings'],
  },
  {
    id: 'anna-nagar',
    name: 'Anna Nagar',
    tag: 'ANNA NAGAR',
    location: '2nd Ave, Anna Nagar, Chennai',
    headline: 'Urban Solarium Pavilion & Contemporary Botanical Bistro',
    description: 'Sunlit glasshouse dining with lush indoor botanicals, contemporary artisanal plates, and private garden cabanas for family and executive gatherings.',
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop',
    timing: '12:00 PM – 11:00 PM (All-Day Dining & Solarium Luncheon)',
    dressCode: 'Smart Casual',
    signatureOfferings: ['Truffle & Wild Mushroom Risotto', 'Artisanal Sourdough & Herb Butter', 'Botanical Infused Mocktails'],
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
    imageUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1Wo3D-NxlZuevsKxWUQc0PzydoS3peIKmiYY6QtnfINRqzJH02yMjS0jyQlLRrPcoks-ukpVd6K5xWLyyhHQfFjxQqZOa5nNWJDBuHYrJTu72nmEU_bCgxQC3pO96YcOrOBKTFu19K5R4fqScnrXH4aKPDEVBcylGJeaLUSEUSH_sHUoCntMrsXi7J-tSUZiq1jax_EwSzs4k4oDLdcrB_MwsYmDDYbVFyhMy_SpJiZyTGzd7-K2F880LY',
    notes: 'Window table near botanical garden requested.',
    sommelierPairing: false,
  },
];

export const INITIAL_REVIEWS: Review[] = [];

