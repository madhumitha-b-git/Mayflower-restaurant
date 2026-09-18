import React, { useState, useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { BrandHeader } from './components/BrandHeader';
import { StatCards } from './components/StatCards';
import { FilterBar, ActiveTab } from './components/FilterBar';
import { StaffTable } from './components/StaffTable';
import { StaffMobileCardList } from './components/StaffMobileCardList';
import { LeaveRequestsView } from './components/LeaveRequestsView';
import { ActivityLogView } from './components/ActivityLogView';
import { OnboardModal } from './components/OnboardModal';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import {
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ACTIVITY_LOGS,
} from './data/mockData';
import { Employee, LeaveRequest, ActivityLog, OutletName, DutyStatus } from './types';
import { CheckCircle, Info } from 'lucide-react';

export default function App() {
  // State
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  const [activeTab, setActiveTab] = useState<ActiveTab>('directory');
  const [selectedOutlet, setSelectedOutlet] = useState<'All' | OutletName>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isOnboardOpen, setIsOnboardOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Supabase Auth placeholder state
  // Ready to connect with Supabase: supabase.auth.getUser() -> user.user_metadata?.full_name
  const [currentUser] = useState({
    name: 'Alexandra Vance',
    email: 'a.vance@maison-group.com',
    role: 'HR Director',
  });

  // Trigger brief toast
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Filter employees based on search query and selected outlet
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesOutlet = selectedOutlet === 'All' || emp.outlet === selectedOutlet;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.outlet.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q);

      return matchesOutlet && matchesQuery;
    });
  }, [employees, selectedOutlet, searchQuery]);

  // Update Duty Status (Clock in, Clock out, On leave)
  const handleUpdateDutyStatus = (employeeId: string, newStatus: DutyStatus) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === employeeId) {
          return {
            ...e,
            dutyStatus: newStatus,
            clockIn: newStatus === 'Clocked In' ? (e.clockIn === '-' ? timeString : e.clockIn) : e.clockIn,
          };
        }
        return e;
      })
    );

    // Add activity log entry
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: timeString,
      employeeName: emp.name,
      outlet: emp.outlet,
      action: newStatus === 'Clocked In' ? 'Clocked In' : newStatus === 'Off Duty' ? 'Clocked Out' : 'Status Updated',
      details: `Status set to ${newStatus} by HR Director`,
      type: newStatus === 'Clocked In' ? 'clock-in' : newStatus === 'Off Duty' ? 'clock-out' : 'leave',
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // Update selected employee in drawer if open
    if (selectedEmployee && selectedEmployee.id === employeeId) {
      setSelectedEmployee((prev) => (prev ? { ...prev, dutyStatus: newStatus } : null));
    }

    showToast(`${emp.name} is now marked as ${newStatus}`);
  };

  // Update full employee data (e.g. outlet / shift changes)
  const handleUpdateEmployee = (updated: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelectedEmployee(updated);

    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      employeeName: updated.name,
      outlet: updated.outlet,
      action: 'Roster Reassigned',
      details: `Assigned to ${updated.outlet} on ${updated.shift}`,
      type: 'swap',
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    showToast(`Updated roster details for ${updated.name}`);
  };

  // Add newly onboarded employee
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [newEmp, ...prev]);

    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      employeeName: newEmp.name,
      outlet: newEmp.outlet,
      action: 'Staff Onboarded',
      details: `Welcome ${newEmp.name} (${newEmp.role}) to ${newEmp.outlet}`,
      type: 'onboard',
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    showToast(`Successfully onboarded ${newEmp.name} to ${newEmp.outlet}!`);
  };

  // Approve leave or shift swap request
  const handleApproveRequest = (requestId: string) => {
    const req = leaveRequests.find((r) => r.id === requestId);
    if (!req) return;

    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Approved' } : r))
    );

    // If it's a leave request, mark employee as on leave
    if (req.type === 'Annual Leave' || req.type === 'Sick Leave') {
      handleUpdateDutyStatus(req.employeeId, 'On Leave');
    }

    showToast(`Approved ${req.type} for ${req.employeeName}`);
  };

  // Reject request
  const handleRejectRequest = (requestId: string) => {
    const req = leaveRequests.find((r) => r.id === requestId);
    if (!req) return;

    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Rejected' } : r))
    );

    showToast(`Request by ${req.employeeName} rejected`, 'info');
  };

  const pendingRequestsCount = leaveRequests.filter((r) => r.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-luxury-dots flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <TopBar
        userName={currentUser.name}
        userRole={currentUser.role}
        onBackToHome={() => {
          setActiveTab('directory');
          setSelectedOutlet('All');
          setSearchQuery('');
          showToast('Navigated to main dashboard view', 'info');
        }}
        onLogout={() => {
          showToast('Session secured. HR Director logged in.', 'info');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Green Brand Banner Card with M · FD Logo and + ONBOARD / EXIT */}
        <BrandHeader
          userName={currentUser.name}
          userRole={currentUser.role}
          onOpenOnboard={() => setIsOnboardOpen(true)}
          onExit={() => showToast('Roster changes saved automatically.', 'info')}
        />

        {/* 4 KPI Metric Cards */}
        <StatCards
          employees={employees}
          leaveRequests={leaveRequests}
          onReviewPending={() => setActiveTab('requests')}
        />

        {/* Navigation Tabs, Salon Location Filter, and Search Bar */}
        <FilterBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedOutlet={selectedOutlet}
          setSelectedOutlet={setSelectedOutlet}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalFiltered={filteredEmployees.length}
          totalEmployees={employees.length}
          pendingRequestsCount={pendingRequestsCount}
        />

        {/* Tab 1: Staff Directory & Shifts */}
        {activeTab === 'directory' && (
          <div>
            {/* Responsive auto: Table on medium/large screens, Cards on mobile */}
            <div className="hidden md:block">
              <StaffTable
                employees={filteredEmployees}
                onSelectEmployee={setSelectedEmployee}
                onUpdateDutyStatus={handleUpdateDutyStatus}
              />
            </div>
            <div className="block md:hidden">
              <StaffMobileCardList
                employees={filteredEmployees}
                onSelectEmployee={setSelectedEmployee}
                onUpdateDutyStatus={handleUpdateDutyStatus}
              />
            </div>
          </div>
        )}

          {/* Tab 2: Shift & Leave Requests Screen */}
          {activeTab === 'requests' && (
            <LeaveRequestsView
              requests={leaveRequests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onResetRequests={() => setLeaveRequests(INITIAL_LEAVE_REQUESTS)}
            />
          )}

          {/* Tab 3: Activity Log Screen */}
          {activeTab === 'activity' && (
            <ActivityLogView logs={activityLogs} />
          )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#0B2B24] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#C5A059]/40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-[#D4A359] shrink-0" />
          )}
          <span className="text-xs font-medium">{toast.message}</span>
        </div>
      )}

      {/* Onboarding Modal */}
      <OnboardModal
        isOpen={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
        onAddEmployee={handleAddEmployee}
        totalEmployees={employees.length}
      />

      {/* Employee Detail & Roster Drawer Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onUpdateDutyStatus={handleUpdateDutyStatus}
        onUpdateEmployee={handleUpdateEmployee}
      />
    </div>
  );
}
