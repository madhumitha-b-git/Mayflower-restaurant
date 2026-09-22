export type TabType = 'overview' | 'staff' | 'customers' | 'outlets' | 'roles-permissions';

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
