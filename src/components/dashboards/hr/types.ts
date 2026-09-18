export type DutyStatus = 'Clocked In' | 'Off Duty' | 'On Leave' | 'Scheduled';

export type OutletName = 'Poes Garden' | 'Palavakkam' | 'Anna Nagar' | 'Egmore';

export interface Employee {
  id: string;
  code: string;
  name: string;
  phone: string;
  avatarInitials: string;
  avatarBg: string;
  role: string;
  outlet: OutletName;
  shift: string;
  dutyStatus: DutyStatus;
  clockIn: string;
  hoursToday: string;
  joined: string;
  email?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  role: string;
  outlet: OutletName;
  avatarInitials: string;
  avatarBg: string;
  type: 'Annual Leave' | 'Sick Leave' | 'Shift Swap' | 'Overtime Request';
  dates: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  employeeName: string;
  outlet: string;
  action: string;
  details: string;
  type: 'clock-in' | 'clock-out' | 'leave' | 'swap' | 'onboard';
}
