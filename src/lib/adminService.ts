import { supabase } from './supabaseClient';
import { UserRole } from '../types';
import { MOCK_FEEDBACK } from '../data/mockSeed';

export interface StaffMember {
  id: string; name: string; email: string; mobile: string | null; role: UserRole; outlet: string | null; is_active: boolean; joined_date: string; created_at: string;
  employee_code: string | null; department: string | null; employment_type: string | null; shift_timing: string | null; date_of_joining: string | null; outlet_name: string | null;
}
export interface CreateStaffPayload { name: string; email: string; mobile: string; password: string; role: UserRole; outlet: string; }
export interface AdminOperationalData { staff: StaffMember[]; outlets: any[]; tables: any[]; reservations: any[]; checklists: any[]; tasks: any[]; feedback: any[]; franchiseLeads: any[]; auditLogs: any[]; }
export interface ReservationRecord { id: string; bookingCode: string; outlet: string; date: string; timeSlot: string; guests: number; status: string; bookedAt: string; }
export interface TransactionRecord { id: string; type: string; points: number; description: string; date: string; }
export interface CustomerRecord { id: string; name: string; email: string; phone: string; reward_points: number; tier: string; joined_date: string; created_at: string; reservations: ReservationRecord[]; transactions: TransactionRecord[]; dietary_preferences: string[]; allergies: string | null; preferred_seating: string | null; birthday: string | null; anniversary: string | null; notes: string | null; total_visits: number; total_reservations: number; total_spent: number; average_spend: number; last_visit_date: string | null; loyalty_tier: string; loyalty_points: number; preferred_outlet_name: string | null; last_visit_outlet_name: string | null; }
const staffRoles: UserRole[] = ['Owner', 'Admin', 'Manager', 'Chef', 'HR', 'Accountant', 'SuperAdmin'];

export const fetchAllStaff = async (): Promise<StaffMember[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id,name,email,mobile,phone,role,outlet,is_active,joined_date,created_at')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const staffList = data.filter((row: any) => {
        const r = (row.role || '').toLowerCase();
        return staffRoles.map(sr => sr.toLowerCase()).includes(r) && r !== 'customer' && r !== 'guest';
      });

      if (staffList.length > 0) {
        return staffList.map((row: any) => ({
          id: row.id,
          name: row.name || row.email?.split('@')[0] || 'Staff Member',
          email: row.email,
          mobile: row.mobile || row.phone || null,
          role: (row.role as UserRole) || 'Admin',
          outlet: row.outlet || null,
          is_active: row.is_active ?? true,
          joined_date: row.joined_date || new Date().toLocaleDateString('en-IN'),
          created_at: row.created_at || new Date().toISOString(),
          employee_code: null,
          department: null,
          employment_type: null,
          shift_timing: null,
          date_of_joining: row.joined_date || null,
          outlet_name: row.outlet || null,
        }));
      }
    }
  } catch (err) {
    console.warn('Could not query staff from user_profiles:', err);
  }

  // Fallback to 'users' table if user_profiles yields no staff
  try {
    const { data: usersData, error: usersErr } = await supabase
      .from('users')
      .select('*');

    if (!usersErr && usersData && usersData.length > 0) {
      return usersData
        .filter((u: any) => {
          const r = (u.role || '').toLowerCase();
          return r !== 'customer' && r !== 'guest';
        })
        .map((u: any) => ({
          id: u.id || `staff-${u.email}`,
          name: u.name || u.email?.split('@')[0] || 'Staff Member',
          email: u.email,
          mobile: u.phone || u.mobile || null,
          role: (u.role as UserRole) || 'Admin',
          outlet: u.outlet || null,
          is_active: true,
        joined_date: new Date().toLocaleDateString('en-IN'),
        created_at: new Date().toISOString(),
        employee_code: null,
        department: null,
        employment_type: null,
        shift_timing: null,
        date_of_joining: null,
        outlet_name: u.outlet || null,
      }));
    }
  } catch {}

  // Local SEED_STAFF fallback
  return [
    { id: 'usr-superadmin', name: 'Super Admin', email: 'superadmin@gmail.com', mobile: null, role: 'SuperAdmin', outlet: null, is_active: true, joined_date: '13 Sept 2026', created_at: new Date().toISOString(), employee_code: 'EMP001', department: 'Management', employment_type: 'Full Time', shift_timing: 'General', date_of_joining: '13 Sept 2026', outlet_name: 'All Outlets' },
    { id: 'usr-owner', name: 'Owner', email: 'owner@gmail.com', mobile: null, role: 'Owner', outlet: null, is_active: true, joined_date: '13 Sept 2026', created_at: new Date().toISOString(), employee_code: 'EMP002', department: 'Executive', employment_type: 'Full Time', shift_timing: 'General', date_of_joining: '13 Sept 2026', outlet_name: 'All Outlets' },
    { id: 'usr-admin', name: 'Admin', email: 'admin@gmail.com', mobile: null, role: 'Admin', outlet: 'Poes Garden', is_active: true, joined_date: '13 Sept 2026', created_at: new Date().toISOString(), employee_code: 'EMP003', department: 'Administration', employment_type: 'Full Time', shift_timing: 'Morning', date_of_joining: '13 Sept 2026', outlet_name: 'Poes Garden' },
    { id: 'usr-manager', name: 'Manager', email: 'manager@gmail.com', mobile: null, role: 'Manager', outlet: 'Poes Garden', is_active: true, joined_date: '13 Sept 2026', created_at: new Date().toISOString(), employee_code: 'EMP004', department: 'Operations', employment_type: 'Full Time', shift_timing: 'Evening', date_of_joining: '13 Sept 2026', outlet_name: 'Poes Garden' },
    { id: 'usr-chef', name: 'Chef', email: 'chef@gmail.com', mobile: null, role: 'Chef', outlet: 'Poes Garden', is_active: true, joined_date: '13 Sept 2026', created_at: new Date().toISOString(), employee_code: 'EMP005', department: 'Kitchen', employment_type: 'Full Time', shift_timing: 'Evening', date_of_joining: '13 Sept 2026', outlet_name: 'Poes Garden' },
    { id: 'usr-hr', name: 'HR', email: 'hr@gmail.com', mobile: null, role: 'HR', outlet: null, is_active: true, joined_date: '13 Sept 2026', created_at: new Date().toISOString(), employee_code: 'EMP006', department: 'Human Resources', employment_type: 'Full Time', shift_timing: 'General', date_of_joining: '13 Sept 2026', outlet_name: 'HQ' },
    { id: 'usr-accountant', name: 'Accountant', email: 'accountant@gmail.com', mobile: null, role: 'Accountant', outlet: null, is_active: true, joined_date: '13 Sept 2026', created_at: new Date().toISOString(), employee_code: 'EMP007', department: 'Finance', employment_type: 'Full Time', shift_timing: 'General', date_of_joining: '13 Sept 2026', outlet_name: 'HQ' },
  ];
};

export const fetchAllCustomers = async (): Promise<CustomerRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id,name,email,phone,reward_points,tier,joined_date,created_at,reservations,transactions')
      .eq('role', 'Customer')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((row: any) => ({
        id: row.id,
        name: row.name || row.email?.split('@')[0] || 'Customer',
        email: row.email,
        phone: row.phone || '',
        reward_points: row.reward_points ?? 200,
        tier: row.tier ?? 'Green',
        joined_date: row.joined_date || new Date().toLocaleDateString('en-IN'),
        created_at: row.created_at || new Date().toISOString(),
        reservations: row.reservations ?? [],
        transactions: row.transactions ?? [],
        dietary_preferences: [],
        allergies: null,
        preferred_seating: null,
        birthday: null,
        anniversary: null,
        notes: null,
        total_visits: row.total_visits ?? 0,
        total_reservations: Array.isArray(row.reservations) ? row.reservations.length : 0,
        total_spent: 0,
        average_spend: 0,
        last_visit_date: null,
        loyalty_tier: row.tier ?? 'Green',
        loyalty_points: row.reward_points ?? 200,
        preferred_outlet_name: null,
        last_visit_outlet_name: null,
      }));
    }
  } catch {}
  return [];
};
export const fetchOutlets = async () => {
  try {
    const { data, error } = await supabase
      .from('outlets')
      .select('id,name,slug,badge,area,petpooja_id,tables_count,covers_count,is_active,opening_time,closing_time')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) return data;
  } catch {}

  return [
    { id: 'o1', name: 'Poes Garden Flagship', slug: 'poes-garden', badge: 'Flagship Sanctuary', area: 'Poes Garden, Chennai', petpooja_id: 'PP-01', tables_count: 24, covers_count: 96, is_active: true, opening_time: '12:00 PM', closing_time: '11:00 PM' },
    { id: 'o2', name: 'Palavakkam ECR Seaside', slug: 'palavakkam-ecr', badge: 'Seaside Sanctuary', area: 'East Coast Road, Chennai', petpooja_id: 'PP-02', tables_count: 18, covers_count: 72, is_active: true, opening_time: '12:00 PM', closing_time: '11:00 PM' },
    { id: 'o3', name: 'Anna Nagar East Pavilion', slug: 'anna-nagar', badge: 'City Pavilion', area: 'Anna Nagar, Chennai', petpooja_id: 'PP-03', tables_count: 16, covers_count: 64, is_active: true, opening_time: '12:00 PM', closing_time: '11:00 PM' },
    { id: 'o4', name: 'Egmore Heritage Manor', slug: 'egmore', badge: 'Heritage Manor', area: 'Egmore, Chennai', petpooja_id: 'PP-04', tables_count: 20, covers_count: 80, is_active: true, opening_time: '12:00 PM', closing_time: '11:00 PM' },
  ];
};

export const fetchAdminOperationalData = async (): Promise<AdminOperationalData> => {
  const safe = async (request: any, source: string) => {
    try {
      const { data, error } = await request;
      if (error) {
        console.warn(`Admin dashboard could not load ${source}: ${error.message}`);
        return [];
      }
      return data ?? [];
    } catch {
      return [];
    }
  };

  // 1. Gather real reservations from user_profiles.reservations and reservations table
  let allReservations: any[] = [];
  try {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, name, email, phone, reservations');

    if (profiles && profiles.length > 0) {
      for (const p of profiles) {
        if (Array.isArray(p.reservations)) {
          for (const res of p.reservations) {
            if (res && (res.id || res.bookingCode || res.date)) {
              allReservations.push({
                id: res.id || `res-${allReservations.length + 1}`,
                booking_code: res.bookingCode || res.booking_code || `MF-${String(res.id || '').slice(-4)}`,
                bookingCode: res.bookingCode || res.booking_code || `MF-${String(res.id || '').slice(-4)}`,
                customer_id: p.id,
                customer_name: p.name || p.email?.split('@')[0] || 'Guest',
                email: p.email,
                phone: p.phone || '',
                outlet: res.outlet || 'Poes Garden Flagship',
                outlet_name: res.outlet || 'Poes Garden Flagship',
                date: res.date || new Date().toISOString().slice(0, 10),
                reservation_date: res.date || new Date().toISOString().slice(0, 10),
                time_slot: res.timeSlot || res.time_slot || '19:00',
                timeSlot: res.timeSlot || res.time_slot || '19:00',
                guests: Number(res.guests || res.party_size || 2),
                party_size: Number(res.guests || res.party_size || 2),
                status: res.status || 'Confirmed',
                seating_area: res.seatingArea || res.seating_area || 'Main Dining',
                created_at: res.bookedAt || new Date().toISOString(),
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not query user_profiles reservations:', err);
  }

  // Also query reservations table (avoid order by nonexistent reservation_date)
  try {
    const { data: dbRes } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (dbRes && dbRes.length > 0) {
      for (const r of dbRes) {
        allReservations.push({
          id: r.id,
          booking_code: r.booking_code || `MF-${String(r.id).slice(0, 4)}`,
          bookingCode: r.booking_code || `MF-${String(r.id).slice(0, 4)}`,
          customer_id: r.customer_id,
          customer_name: r.customer_name || 'Guest',
          outlet: r.outlet_name || r.outlet_id || 'Poes Garden',
          outlet_name: r.outlet_name || r.outlet_id || 'Poes Garden',
          date: r.date || r.reservation_date || new Date().toISOString().slice(0, 10),
          reservation_date: r.date || r.reservation_date || new Date().toISOString().slice(0, 10),
          time_slot: r.time_slot || r.reservation_time || '19:00',
          timeSlot: r.time_slot || r.reservation_time || '19:00',
          guests: Number(r.guests || r.party_size || 2),
          party_size: Number(r.guests || r.party_size || 2),
          status: r.status || 'Confirmed',
          created_at: r.created_at || new Date().toISOString(),
        });
      }
    }
  } catch {}

  // Deduplicate reservations
  const seenKeys = new Set<string>();
  const uniqueReservations: any[] = [];
  for (const r of allReservations) {
    const key = r.booking_code || r.id;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueReservations.push(r);
    }
  }

  // 2. Fetch feedback
  let allFeedback: any[] = [];
  try {
    const { data: dbFeedback } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (dbFeedback && dbFeedback.length > 0) {
      allFeedback = dbFeedback.map((fb: any) => ({
        ...fb,
        comments: fb.comment || fb.comments || '',
        customer_name: fb.customer_name || 'Guest',
      }));
    }
  } catch {}

  if (allFeedback.length === 0) {
    try {
      const stored = localStorage.getItem('mayflower_mock_db_v5_feedback');
      if (stored) {
        allFeedback = JSON.parse(stored);
      }
    } catch {}

    if (allFeedback.length === 0) {
      allFeedback = MOCK_FEEDBACK.map(f => ({
        id: f.id,
        customer_name: f.customerName,
        email: f.email,
        outlet_name: f.outlet,
        outlet: f.outlet,
        rating: f.rating,
        comments: f.message || '',
        status: f.status,
        created_at: f.createdAt,
      }));
    }
  }

  const [staff, outlets, tables, checklists, tasks, franchiseLeads, auditLogs] = await Promise.all([
    fetchAllStaff(),
    safe(supabase.from('outlets').select('*').order('name'), 'outlets'),
    safe(supabase.from('tables').select('*').limit(100), 'tables'),
    safe(supabase.from('checklists').select('*').order('created_at', { ascending: false }).limit(100), 'checklists'),
    safe(supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(100), 'tasks'),
    safe(supabase.from('franchise_enquiries').select('*').order('created_at', { ascending: false }).limit(100), 'franchise enquiries'),
    safe(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100), 'activity records'),
  ]);

  return {
    staff,
    outlets,
    tables,
    reservations: uniqueReservations,
    checklists,
    tasks,
    feedback: allFeedback,
    franchiseLeads,
    auditLogs,
  };
};

export const createStaffMember = async (payload: CreateStaffPayload): Promise<{ error?: string }> => {
  try {
    const newStaffId = `staff-${Date.now()}`;
    const { hashPassword } = await import('./passwordUtils');
    const pwdHash = await hashPassword(payload.password);
    const normalizedEmail = payload.email.trim().toLowerCase();

    await supabase.from('users').insert({
      id: newStaffId,
      name: payload.name,
      email: normalizedEmail,
      password_hash: pwdHash,
      role: payload.role,
      phone: payload.mobile,
      is_active: true,
    });

    await supabase.from('user_profiles').insert({
      id: newStaffId,
      name: payload.name,
      email: normalizedEmail,
      phone: payload.mobile,
      role: payload.role,
      outlet: payload.outlet,
      is_active: true,
      reward_points: 500,
      tier: 'Sanctuary VIP',
      total_visits: 0,
      joined_date: new Date().toLocaleDateString('en-IN'),
      transactions: [],
      reservations: [],
    });

    return {};
  } catch (err: any) {
    return { error: err?.message || 'Failed to create staff member.' };
  }
};
export const toggleStaffActive = async (id: string, is_active: boolean): Promise<{ error?: string }> => { const { error } = await supabase.from('user_profiles').update({ is_active }).eq('id', id); return error ? { error: error.message } : {}; };
export const updateStaffAssignment = async (id: string, role: UserRole, outlet: string | null): Promise<{ error?: string }> => { const { error } = await supabase.from('user_profiles').update({ role, outlet }).eq('id', id); return error ? { error: error.message } : {}; };
