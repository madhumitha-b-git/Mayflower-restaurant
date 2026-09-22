import { UserProfile, UserRole } from '../types';

export interface ReservationLike {
  id?: string;
  customer_id?: string;
  customerId?: string;
  user_id?: string;
  email?: string;
  outlet?: string | null;
  status?: string;
}

export interface TaskLike {
  id?: string;
  assigned_user_id?: string;
  assignedUserId?: string;
  assigned_role?: string;
  assignedRole?: string;
  outlet?: string | null;
  status?: string;
}

export interface FeedbackLike {
  id?: string;
  customer_id?: string;
  user_id?: string;
  email?: string;
  outlet?: string | null;
}

/** Check if user is SuperAdmin */
export const isSuperAdmin = (user?: UserProfile | null): boolean => {
  return user?.role === 'SuperAdmin';
};

/** Check if user is Owner/Management */
export const isOwner = (user?: UserProfile | null): boolean => {
  return user?.role === 'Owner';
};

/** Check if user is Admin */
export const isAdmin = (user?: UserProfile | null): boolean => {
  return user?.role === 'Admin';
};

/** Check if user is Outlet Manager */
export const isManager = (user?: UserProfile | null): boolean => {
  return user?.role === 'Manager';
};

/** Check if user is Chef */
export const isChef = (user?: UserProfile | null): boolean => {
  return user?.role === 'Chef';
};

/** Check if user is HR */
export const isHR = (user?: UserProfile | null): boolean => {
  return user?.role === 'HR';
};

/** Check if user is Accountant */
export const isAccountant = (user?: UserProfile | null): boolean => {
  return user?.role === 'Accountant';
};

/** Check if user is Customer */
export const isCustomer = (user?: UserProfile | null): boolean => {
  return !user?.role || user.role === 'Customer';
};

/** Role assignment: ONLY SuperAdmin can assign roles or change user roles */
export const canAssignRole = (actor?: UserProfile | null, _targetUserId?: string, _newRole?: UserRole): boolean => {
  return isSuperAdmin(actor);
};

/** User directory access: SuperAdmin, Owner, Admin, Manager, HR can view staff directory */
export const canViewStaffDirectory = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isOwner(user) || isAdmin(user) || isManager(user) || isHR(user);
};

/** User profile editing: SuperAdmin can edit anyone, users can edit their own profile */
export const canEditUserProfile = (actor?: UserProfile | null, targetUserId?: string): boolean => {
  if (!actor) return false;
  if (isSuperAdmin(actor)) return true;
  return actor.id === targetUserId;
};

/** Reservation Viewing Policy */
export const canViewReservation = (user?: UserProfile | null, reservation?: ReservationLike): boolean => {
  if (!user) return false;
  if (isSuperAdmin(user) || isOwner(user)) return true;
  if (isAdmin(user) || isManager(user) || isChef(user)) return true;
  if (isCustomer(user)) {
    if (!reservation) return true;
    const cid = reservation.customer_id || reservation.customerId || reservation.user_id;
    return cid === user.id || (Boolean(reservation.email) && reservation.email?.toLowerCase() === user.email?.toLowerCase());
  }
  return false;
};

/** Reservation Management Policy (Approve, Reject, Cancel, Table Assign) */
export const canManageReservation = (user?: UserProfile | null, _reservation?: ReservationLike): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isOwner(user) || isAdmin(user) || isManager(user);
};

/** Customer Data Privacy Policy */
export const canViewCustomerData = (user?: UserProfile | null, targetCustomerId?: string): boolean => {
  if (!user) return false;
  if (isSuperAdmin(user) || isOwner(user) || isAdmin(user) || isManager(user)) return true;
  if (isCustomer(user)) {
    return user.id === targetCustomerId;
  }
  return false;
};

/** Feedback Viewing Policy */
export const canViewFeedback = (user?: UserProfile | null, feedback?: FeedbackLike): boolean => {
  if (!user) return false;
  if (isSuperAdmin(user) || isOwner(user) || isAdmin(user) || isManager(user)) return true;
  if (isCustomer(user)) {
    if (!feedback) return true;
    const cid = feedback.customer_id || feedback.user_id;
    return cid === user.id || (Boolean(feedback.email) && feedback.email?.toLowerCase() === user.email?.toLowerCase());
  }
  return false;
};

/** Feedback Submission Policy */
export const canSubmitFeedback = (user?: UserProfile | null): boolean => {
  return Boolean(user);
};

/** Franchise Enquiry Viewing Policy */
export const canViewFranchiseEnquiries = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isOwner(user) || isAdmin(user);
};

/** Outlet Management Policies */
export const canManageOutlets = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user);
};

export const canCreateOutlet = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user);
};

export const canEditOutlet = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user);
};

export const canPublishOutlet = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user);
};

export const canDeleteOutlet = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user);
};

export const canViewOutlets = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isOwner(user) || isAdmin(user) || isManager(user);
};

/** Audit Logs Policy */
export const canViewAuditLogs = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isOwner(user) || isAdmin(user) || isManager(user);
};

/** SOP & Task Management Policy */
export const canManageSOPsAndTasks = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isOwner(user) || isAdmin(user) || isManager(user);
};

/** Task Status Update Policy (Chef can update assigned tasks, Manager/Admin/Owner/SuperAdmin can update any) */
export const canUpdateTaskStatus = (user?: UserProfile | null, task?: TaskLike): boolean => {
  if (!user) return false;
  if (isSuperAdmin(user) || isOwner(user) || isAdmin(user) || isManager(user)) return true;
  if (isChef(user)) {
    if (!task) return true;
    const role = task.assigned_role || task.assignedRole;
    const uid = task.assigned_user_id || task.assignedUserId;
    return uid === user.id || role === 'Chef';
  }
  return false;
};

// ── SOP & Checklist RBAC Policy Matrix Functions ────────────────────────────

/** Check if user can access the SOP & Checklist module (SuperAdmin, Admin, Owner, Manager, Chef) */
export const canAccessSOPModule = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isAdmin(user) || isOwner(user) || isManager(user) || isChef(user);
};

/** Template Creation Policy: Super Admin & Admin only */
export const canCreateChecklistTemplate = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isAdmin(user);
};

/** Template Edit/Delete Policy: Super Admin & Admin only */
export const canEditOrDeleteTemplate = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isAdmin(user);
};

/** Shift Assignment Policy: Super Admin, Admin, and Manager */
export const canAssignChecklistToStaff = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isAdmin(user) || isManager(user);
};

/** View All Outlets Policy: Super Admin, Admin, and Owner (View Only) */
export const canViewAllOutletChecklists = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isAdmin(user) || isOwner(user);
};

/** View Own Outlet Policy: Super Admin, Admin, Owner, Manager, Chef */
export const canViewOwnOutletChecklists = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isAdmin(user) || isOwner(user) || isManager(user) || isChef(user);
};

/** Fill in / Complete Policy: Super Admin, Admin, Manager, Chef (assigned tasks only) */
export const canFillOrCompleteChecklist = (
  user?: UserProfile | null,
  execution?: { outlet?: string; assignedUserId?: string; assignedRole?: string }
): boolean => {
  if (!user) return false;
  if (isSuperAdmin(user) || isAdmin(user) || isManager(user)) return true;
  if (isChef(user)) {
    if (!execution) return true;
    return (
      execution.assignedUserId === user.id ||
      execution.assignedRole === 'Chef' ||
      !execution.assignedUserId
    );
  }
  return false;
};

/** Financial Views Policy (SuperAdmin, Owner, Admin, Manager, Accountant) */
export const canViewFinancialReports = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isOwner(user) || isAdmin(user) || isManager(user) || isAccountant(user);
};

