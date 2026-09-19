export type MenuCategoryType = 
  | 'all'
  | 'dim-sum'
  | 'starters'
  | 'pizza'
  | 'pasta'
  | 'burgers'
  | 'asian-bowls'
  | 'desserts-beverages';

export type CuisineType = MenuCategoryType | string;

export interface Dish {
  id: string;
  name: string;
  category: MenuCategoryType;
  categoryName?: string;
  cuisine?: string;
  description: string;
  price: number;
  isVeg: boolean;
  isChefPick: boolean;
  image: string;
  portion?: string;
  calories?: string;
}

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  accent: string;
}

export interface LocationOutlet {
  id: string;
  name: string;
  tagline: string;
  address: string;
  hours: string;
  phone: string;
  description: string;
  image: string;
  icon: string;
  mapCoordinates: { x: number; y: number }; // Percentage for interactive map
  highlights: string[];
  gmapUrl?: string;
}

export type SeatingAreaType = 'Garden' | 'Window' | 'Main Dining' | 'Private Space';

export type TableStatus = 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Blocked';

export interface RestaurantTable {
  id: string;
  name: string;
  area: SeatingAreaType;
  seats: number;
  locationDescription: string;
  note: string;
  isAvailable: boolean;
  status?: TableStatus;
  isChefRecommended?: boolean;
  assignedGuestName?: string;
  assignedGuestPhone?: string;
  assignedBookingCode?: string;
  assignedTimeSlot?: string;
  assignedGuestsCount?: number;
  assignedDietary?: string;
  assignedOccasion?: string;
}

export type DiningExperienceType = 'Lunch' | 'Dinner' | 'Celebration' | 'Casual';

export interface ReservationState {
  step: number; // 1 to 8
  selectedOutlet: string;
  date: string;
  dateLabel: string;
  guests: number;
  guestLabel: string;
  experience: DiningExperienceType;
  seatingArea: SeatingAreaType;
  selectedTable: RestaurantTable | null;
  timeSlot: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  dietaryPreferences: string;
  specialOccasion: string;
  specialNotes: string;
  bookingCode: string;
}

export type ActiveModalType = 'none' | 'franchise' | 'feedback' | 'general' | 'cellar' | 'drinks' | 'auth' | 'loyalty';

export type LoyaltyTier = 'Green' | 'Gold' | 'Sanctuary VIP';

export interface PointTransaction {
  id: string;
  type: 'earned_signup' | 'earned_visit' | 'earned_dining' | 'redeemed_giftcard' | 'cancelled_reservation';
  points: number;
  description: string;
  date: string;
}

export interface UserReservationRecord {
  id: string;
  bookingCode: string;
  outlet: string;
  date: string;
  timeSlot: string;
  guests: number;
  seatingArea: string;
  status: 'Pending' | 'Confirmed' | 'Seated' | 'Completed' | 'Cancelled';
  bookedAt: string;
  assignedTable?: string;
}

export type UserRole = 'SuperAdmin' | 'Owner' | 'Admin' | 'Manager' | 'Chef' | 'HR' | 'Accountant' | 'Customer';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  rewardPoints: number;
  tier: LoyaltyTier;
  role?: UserRole;
  totalVisits: number;
  joinedDate: string;
  transactions: PointTransaction[];
  reservations?: UserReservationRecord[];
}

export type TabType = 'overview' | 'staff' | 'customers' | 'outlets' | 'roles-permissions' | 'audit-log';

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  email: string;
  mobile: string;
  role: 'SUPER ADMIN' | 'OWNER' | 'ADMIN' | 'MANAGER' | 'CHEF' | 'HR' | 'ACCOUNTANT';
  department: string;
  outlet: string;
  empCode: string;
  status: 'ACTIVE' | 'ON LEAVE' | 'RESTRICTED';
  initials: string;
}

export interface CustomerProfile {
  id: string;
  guestId: string;
  name: string;
  email: string;
  phone: string;
  tier: 'GREEN' | 'GOLD' | 'BLACK';
  tierLabel: string;
  points: number;
  visits: number;
  bookings: number;
  totalSpend: number;
  avgSpend: number;
  lastVisit: string;
  joinedDate: string;
  initials: string;
  vipNotes?: string;
  preferredSeating?: string;
  favoriteWine?: string;
}

export interface Outlet {
  id: string;
  name: string;
  typeLabel: string;
  address: string;
  tablesCount: number;
  coversCount: number;
  hours: string;
  posId: string;
  posStatus: 'ONLINE' | 'STANDBY' | 'SYNCING';
  currentLoadTables: number;
  maxTables: number;
  capacityPercent: number;
  reservedWave: string;
  statusNote: string;
  imageUrl: string;
  verifiedTag: string;
  tables: Array<{
    id: string;
    number: string;
    type: 'booth' | 'table' | 'alcove' | 'cabana';
    covers: number;
    status: 'occupied' | 'reserved' | 'available';
    guestName?: string;
  }>;
}

export interface RoleMatrixRow {
  id: string;
  roleName: string;
  subtitle: string;
  personnelCount: number;
  isImmutable?: boolean;
  rootConfig: boolean | 'locked';
  financials: boolean | 'locked';
  staffMgmt: boolean | 'locked';
  liveOps: boolean | 'locked';
  guestPii: boolean | 'locked';
  overrides: boolean | 'locked';
  inspect: boolean | 'locked';
  authorizations: Array<{ name: string; status: 'Granted' | 'Auth PIN' | 'Revoked' | 'Restricted' }>;
  securityPolicies: {
    mfa: string;
    sessionTimeout: string;
    ipPerimeter: string;
    piiRedaction: string;
  };
  clusterCoverage: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: 'SUPERADMIN' | 'CHEF' | 'MANAGER' | 'ACCOUNTANT' | 'HR' | 'OWNER' | 'ADMIN';
  action: string;
  targetType: string;
  targetId: string;
  payload: Record<string, any>;
  hmacStatus: string;
  outlet: string;
  ip: string;
  isOverride?: boolean;
  category: 'rbac' | 'reservations' | 'overrides' | 'security' | 'kitchen';
}

export interface RecentActivity {
  id: string;
  time: string;
  outlet: string;
  personName: string;
  action: 'Dine in' | 'Take away' | 'Booked a slot';
  amount: number;
}
