import { UserProfile, UserRole } from '../types';

export interface SeedReservation {
  id: string;
  bookingCode: string;
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  outlet: string;
  date: string;
  timeSlot: string;
  guests: number;
  seatingArea: string;
  status: 'Pending' | 'Confirmed' | 'Seated' | 'Completed' | 'Cancelled';
  bookedAt: string;
  specialRequests?: string;
  assignedTable?: string;
}

export interface SeedTask {
  id: string;
  title: string;
  category: string;
  outlet: string;
  assignedRole: UserRole;
  assignedUserId?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Escalated';
  dueAt: string;
  completedAt?: string;
  completedBy?: string;
  remarks?: string;
}

export interface SeedFeedback {
  id: string;
  customerId?: string;
  customerName: string;
  email: string;
  outlet: string;
  rating: number;
  message: string;
  status: 'New' | 'Reviewed' | 'Flagged' | 'Resolved';
  createdAt: string;
  reservationId?: string;
}

export interface SeedFranchiseEnquiry {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  cityInterested: string;
  message: string;
  status: 'New' | 'Under Review' | 'Contacted' | 'Qualified' | 'Closed';
  internalNotes?: string;
  createdAt: string;
  investmentBudget?: string;
  priorExperience?: boolean;
  customerId?: string;
  documents?: Array<{ id: string; fileName: string; storagePath: string; uploadedAt: string }>;
}

export interface SeedAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  outlet?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SeedOutlet {
  id: string;
  name: string;
  slug: string;
  badge: string;
  area: string;
  petpoojaId: string;
  tablesCount: number;
  coversCount: number;
  isActive: boolean;
  openingTime: string;
  closingTime: string;
}

const TODAY = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const MOCK_USERS: UserProfile[] = [
  // SuperAdmins (2)
  { id: 'usr-superadmin-1', name: 'Super Admin Principal', phone: '+91 98400 00001', email: 'superadmin@gmail.com', role: 'SuperAdmin', rewardPoints: 1000, tier: 'Sanctuary VIP', totalVisits: 50, joinedDate: '01 Jan 2026', transactions: [] },
  { id: 'usr-superadmin-2', name: 'Dev Ops SuperAdmin', phone: '+91 98400 00002', email: 'superadmin2@gmail.com', role: 'SuperAdmin', rewardPoints: 1000, tier: 'Sanctuary VIP', totalVisits: 30, joinedDate: '15 Jan 2026', transactions: [] },

  // Owners (2)
  { id: 'usr-owner-1', name: 'Dr. Kalanithi Maran (Owner)', phone: '+91 98400 00003', email: 'owner@gmail.com', role: 'Owner', rewardPoints: 2500, tier: 'Sanctuary VIP', totalVisits: 40, joinedDate: '01 Feb 2026', transactions: [] },
  { id: 'usr-owner-2', name: 'Anuradha Maran (Co-Owner)', phone: '+91 98400 00004', email: 'owner2@gmail.com', role: 'Owner', rewardPoints: 2500, tier: 'Sanctuary VIP', totalVisits: 35, joinedDate: '01 Feb 2026', transactions: [] },

  // Admins (2)
  { id: 'usr-admin-1', name: 'Karthik Admin', phone: '+91 98400 00005', email: 'admin@gmail.com', role: 'Admin', rewardPoints: 500, tier: 'Gold', totalVisits: 20, joinedDate: '10 Feb 2026', transactions: [] },
  { id: 'usr-admin-2', name: 'Sanjay Admin', phone: '+91 98400 00006', email: 'admin2@gmail.com', role: 'Admin', rewardPoints: 500, tier: 'Gold', totalVisits: 18, joinedDate: '12 Feb 2026', transactions: [] },

  // Managers (2)
  { id: 'usr-manager-1', name: 'Vikram Seth (Manager)', phone: '+91 98400 00007', email: 'manager@gmail.com', role: 'Manager', rewardPoints: 400, tier: 'Gold', totalVisits: 15, joinedDate: '01 Mar 2026', transactions: [] },
  { id: 'usr-manager-2', name: 'Priya Sundaram (Manager)', phone: '+91 98400 00008', email: 'manager2@gmail.com', role: 'Manager', rewardPoints: 400, tier: 'Gold', totalVisits: 12, joinedDate: '05 Mar 2026', transactions: [] },

  // Chefs (2)
  { id: 'usr-chef-1', name: 'Chef Rajesh Sharma', phone: '+91 98400 00009', email: 'chef@gmail.com', role: 'Chef', rewardPoints: 300, tier: 'Green', totalVisits: 10, joinedDate: '10 Mar 2026', transactions: [] },
  { id: 'usr-chef-2', name: 'Chef Kavita Menon', phone: '+91 98400 00010', email: 'chef2@gmail.com', role: 'Chef', rewardPoints: 300, tier: 'Green', totalVisits: 8, joinedDate: '15 Mar 2026', transactions: [] },

  // HR (2)
  { id: 'usr-hr-1', name: 'Meera Patel (HR Lead)', phone: '+91 98400 00011', email: 'hr@gmail.com', role: 'HR', rewardPoints: 300, tier: 'Green', totalVisits: 5, joinedDate: '20 Mar 2026', transactions: [] },
  { id: 'usr-hr-2', name: 'Arjun HR Specialist', phone: '+91 98400 00012', email: 'hr2@gmail.com', role: 'HR', rewardPoints: 300, tier: 'Green', totalVisits: 4, joinedDate: '22 Mar 2026', transactions: [] },

  // Accountants (2)
  { id: 'usr-accountant-1', name: 'Siddharth Rao (Finance)', phone: '+91 98400 00013', email: 'accountant@gmail.com', role: 'Accountant', rewardPoints: 300, tier: 'Green', totalVisits: 6, joinedDate: '01 Apr 2026', transactions: [] },
  { id: 'usr-accountant-2', name: 'Deepa Auditor', phone: '+91 98400 00014', email: 'accountant2@gmail.com', role: 'Accountant', rewardPoints: 300, tier: 'Green', totalVisits: 3, joinedDate: '05 Apr 2026', transactions: [] },

  // Customers (2)
  { id: 'usr-customer-1', name: 'Ananya Roy', phone: '+91 98400 99999', email: 'customer@gmail.com', role: 'Customer', rewardPoints: 850, tier: 'Gold', totalVisits: 12, joinedDate: '10 May 2026', transactions: [
    { id: 'tx-1', type: 'earned_signup', points: 200, description: 'Welcome Bonus for joining Mayflower Sanctuary', date: '10 May 2026' },
    { id: 'tx-2', type: 'earned_visit', points: 300, description: 'Dining points earned at Poes Garden Flagship', date: '25 Jun 2026' },
    { id: 'tx-3', type: 'earned_dining', points: 350, description: 'Bonus points for Degustation Experience', date: '10 Aug 2026' },
  ] },
  { id: 'usr-customer-2', name: 'Rohan Gupta', phone: '+91 98400 88888', email: 'customer2@gmail.com', role: 'Customer', rewardPoints: 350, tier: 'Green', totalVisits: 3, joinedDate: '01 Jun 2026', transactions: [
    { id: 'tx-4', type: 'earned_signup', points: 200, description: 'Welcome Bonus for joining Mayflower Sanctuary', date: '01 Jun 2026' },
    { id: 'tx-5', type: 'earned_visit', points: 150, description: 'Seaside dining at Palavakkam ECR', date: '15 Jul 2026' },
  ] },
];

export const MOCK_OUTLETS: SeedOutlet[] = [
  { id: 'o1', name: 'Poes Garden Flagship', slug: 'poes-garden', badge: 'Flagship Sanctuary', area: 'Poes Garden, Chennai', petpoojaId: 'PP-01', tablesCount: 24, coversCount: 96, isActive: true, openingTime: '12:00 PM', closingTime: '11:00 PM' },
  { id: 'o2', name: 'Palavakkam ECR Seaside', slug: 'palavakkam-ecr', badge: 'Seaside Sanctuary', area: 'East Coast Road, Chennai', petpoojaId: 'PP-02', tablesCount: 18, coversCount: 72, isActive: true, openingTime: '12:00 PM', closingTime: '11:00 PM' },
  { id: 'o3', name: 'Anna Nagar East Pavilion', slug: 'anna-nagar', badge: 'City Pavilion', area: 'Anna Nagar, Chennai', petpoojaId: 'PP-03', tablesCount: 16, coversCount: 64, isActive: true, openingTime: '12:00 PM', closingTime: '11:00 PM' },
  { id: 'o4', name: 'Velachery Lakeside Conservatory', slug: 'velachery', badge: 'Lakeside Conservatory', area: 'Velachery, Chennai', petpoojaId: 'PP-04', tablesCount: 20, coversCount: 80, isActive: true, openingTime: '12:00 PM', closingTime: '11:00 PM' },
];

export const MOCK_RESERVATIONS: SeedReservation[] = [
  { id: 'res-101', bookingCode: 'MF-8812', customerId: 'usr-customer-1', customerName: 'Ananya Roy', email: 'customer@gmail.com', phone: '+91 98400 99999', outlet: 'Poes Garden Flagship', date: TODAY, timeSlot: '19:30', guests: 4, seatingArea: 'Conservatory', status: 'Confirmed', bookedAt: 'Yesterday', specialRequests: 'Anniversary table near garden view' },
  { id: 'res-102', bookingCode: 'MF-8813', customerId: 'usr-customer-1', customerName: 'Ananya Roy', email: 'customer@gmail.com', phone: '+91 98400 99999', outlet: 'Palavakkam ECR Seaside', date: TODAY, timeSlot: '20:15', guests: 2, seatingArea: 'Seaside Terrace', status: 'Pending', bookedAt: TODAY, specialRequests: 'Wine pairing recommendation' },
  { id: 'res-103', bookingCode: 'MF-8814', customerId: 'usr-customer-2', customerName: 'Rohan Gupta', email: 'customer2@gmail.com', phone: '+91 98400 88888', outlet: 'Anna Nagar East Pavilion', date: TODAY, timeSlot: '13:00', guests: 6, seatingArea: 'Main Pavilion', status: 'Seated', bookedAt: '12 Sep 2026', specialRequests: 'High chair required for 1 toddler' },
  { id: 'res-104', bookingCode: 'MF-8815', customerId: 'usr-customer-2', customerName: 'Rohan Gupta', email: 'customer2@gmail.com', phone: '+91 98400 88888', outlet: 'Velachery Lakeside Conservatory', date: TODAY, timeSlot: '21:00', guests: 2, seatingArea: 'Private Conservatory', status: 'Completed', bookedAt: '10 Sep 2026' },
  { id: 'res-105', bookingCode: 'MF-8816', customerId: 'usr-customer-1', customerName: 'Ananya Roy', email: 'customer@gmail.com', phone: '+91 98400 99999', outlet: 'Poes Garden Flagship', date: '14 Sep 2026', timeSlot: '20:00', guests: 4, seatingArea: 'Chef Lounge', status: 'Cancelled', bookedAt: '08 Sep 2026', specialRequests: 'Cancelled due to travel conflict' },
];

export const MOCK_TASKS: SeedTask[] = [
  { id: 'task-1', title: 'Morning Kitchen Temperature Audit & Cold Storage Log', category: 'Hygiene & Prep', outlet: 'Poes Garden Flagship', assignedRole: 'Chef', assignedUserId: 'usr-chef-1', priority: 'High', status: 'In Progress', dueAt: '10:00 AM', remarks: 'Freezer #2 set to -18°C' },
  { id: 'task-2', title: 'Seaside Deck Furniture & Lighting Inspection', category: 'Floor Readiness', outlet: 'Palavakkam ECR Seaside', assignedRole: 'Manager', assignedUserId: 'usr-manager-1', priority: 'Medium', status: 'Completed', dueAt: '11:30 AM', completedAt: '11:15 AM', completedBy: 'usr-manager-1', remarks: 'All lights functional' },
  { id: 'task-3', title: 'Sommelier Wine Inventory & Cellar Temperature Log', category: 'Bar Operations', outlet: 'Poes Garden Flagship', assignedRole: 'Manager', assignedUserId: 'usr-manager-1', priority: 'Medium', status: 'Pending', dueAt: '03:00 PM' },
  { id: 'task-4', title: 'HVAC Airflow & Thermostat Calibration in Conservatory', category: 'Maintenance', outlet: 'Anna Nagar East Pavilion', assignedRole: 'Chef', assignedUserId: 'usr-chef-2', priority: 'Critical', status: 'Escalated', dueAt: '02:00 PM', remarks: 'Requires technician review' },
];

export const MOCK_FEEDBACK: SeedFeedback[] = [
  { id: 'fb-101', customerId: 'usr-customer-1', customerName: 'Ananya Roy', email: 'customer@gmail.com', outlet: 'Poes Garden Flagship', rating: 5, message: 'Exquisite Degustation menu and exceptional sommelier pairing! Highly recommended.', status: 'Reviewed', createdAt: '12 Sep 2026', reservationId: 'res-101' },
  { id: 'fb-102', customerId: 'usr-customer-2', customerName: 'Rohan Gupta', email: 'customer2@gmail.com', outlet: 'Palavakkam ECR Seaside', rating: 5, message: 'Beautiful seaside ambiance, swift reservation seating and polite captain.', status: 'Resolved', createdAt: '10 Sep 2026', reservationId: 'res-104' },
  { id: 'fb-103', customerId: 'usr-customer-1', customerName: 'Ananya Roy', email: 'customer@gmail.com', outlet: 'Anna Nagar East Pavilion', rating: 4, message: 'Lovely desserts, though table assignment took 5 minutes past reservation time.', status: 'New', createdAt: TODAY },
];

export const MOCK_FRANCHISE_ENQUIRIES: SeedFranchiseEnquiry[] = [
  { id: 'fr-1', applicantName: 'Suresh Kumar', email: 'suresh.k@gmail.com', phone: '+91 98410 55555', cityInterested: 'Coimbatore', message: 'Interested in establishing a flagship Mayflower Sanctuary in Race Course area.', status: 'Under Review', internalNotes: 'Strong financial backing; site plan under review by SuperAdmin.', createdAt: '05 Sep 2026' },
  { id: 'fr-2', applicantName: 'Lakshmi Narayanan', email: 'lnarayanan@gmail.com', phone: '+91 98410 77777', cityInterested: 'Bengaluru', message: 'Looking for franchise rights for Indiranagar location.', status: 'New', internalNotes: 'Initial enquiry submitted.', createdAt: '11 Sep 2026' },
];

export const MOCK_AUDIT_LOGS: SeedAuditLog[] = [
  { id: 'log-1', actorId: 'usr-superadmin-1', actorName: 'Super Admin Principal', actorRole: 'SuperAdmin', action: 'ROLE_ASSIGNMENT', entityType: 'UserProfile', entityId: 'usr-hr-1', outlet: 'HQ', metadata: { oldRole: 'Admin', newRole: 'HR' }, createdAt: '10 Sep 2026 14:30' },
  { id: 'log-2', actorId: 'usr-manager-1', actorName: 'Vikram Seth (Manager)', actorRole: 'Manager', action: 'RESERVATION_CONFIRMED', entityType: 'Reservation', entityId: 'res-101', outlet: 'Poes Garden Flagship', metadata: { table: 'Conservatory C1' }, createdAt: '12 Sep 2026 18:45' },
  { id: 'log-3', actorId: 'usr-chef-1', actorName: 'Chef Rajesh Sharma', actorRole: 'Chef', action: 'TASK_COMPLETED', entityType: 'ChecklistTask', entityId: 'task-1', outlet: 'Poes Garden Flagship', metadata: { remarks: 'Temperature verified' }, createdAt: TODAY },
];
