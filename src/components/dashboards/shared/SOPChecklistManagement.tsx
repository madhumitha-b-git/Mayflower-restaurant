import React, { useState, useMemo } from 'react';
import {
  ClipboardList, Plus, CheckCircle2, Clock, AlertTriangle,
  Camera, MapPin, CheckSquare,
  ShieldCheck, AlertCircle, Trash2, Edit3,
  Calendar, Building2, ChefHat, RefreshCw, X,
  ChevronRight, Award, ArrowUpRight, Upload
} from 'lucide-react';
import {
  UserProfile,
  ChecklistTemplate,
  ChecklistExecution,
  ChecklistCategory,
  ChecklistTaskPriority,
  TemplateTaskItem,
  ExecutionTaskItem,
  UserRole
} from '../../../types';
import {
  useSOPAndChecklists,
  createChecklistTemplate,
  updateChecklistTemplate,
  deleteChecklistTemplate,
  assignChecklistToShift,
  updateTaskProgress,
  reviewChecklistExecution,
  getStoredExecutions
} from '../../../data/sopStorage';
import {
  canCreateChecklistTemplate,
  canEditOrDeleteTemplate,
  canAssignChecklistToStaff,
  canViewAllOutletChecklists,
  canFillOrCompleteChecklist
} from '../../../rbac/policies';

interface Props {
  user: UserProfile;
  initialTab?: 'executions' | 'templates' | 'compliance';
}

const ALL_OUTLETS = [
  'Anna Nagar Flagship Solarium',
  'Poes Garden Conservatory',
  'Palavakkam Seaside Courtyard',
  'Egmore Art District',
  'Nungambakkam Heritage',
  'Adyar Estuary Pavilion',
  'Besant Nagar Beachside',
  'Alwarpet Bistro & Bar',
  'Velachery Urban Verandah',
  'OMR Tech Corridor',
  'ECR Coastal Retreat',
  'Kilpauk Colonial House'
];

const CATEGORIES: ChecklistCategory[] = ['Opening', 'Closing', 'Food Prep', 'Hygiene', 'Bar', 'Store', 'Safety', 'Mid-Shift'];

const CATEGORY_COLORS: Record<ChecklistCategory, string> = {
  Opening: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Food Prep': 'bg-orange-50 text-orange-700 border-orange-200',
  Hygiene: 'bg-teal-50 text-teal-700 border-teal-200',
  Bar: 'bg-purple-50 text-purple-700 border-purple-200',
  Store: 'bg-stone-50 text-stone-700 border-stone-200',
  Safety: 'bg-rose-50 text-rose-700 border-rose-200',
  'Mid-Shift': 'bg-amber-50 text-amber-700 border-amber-200'
};

const PRIORITY_BADGES: Record<ChecklistTaskPriority, string> = {
  Low: 'bg-stone-100 text-stone-600',
  Medium: 'bg-blue-50 text-blue-700',
  High: 'bg-amber-50 text-amber-700 font-semibold',
  Critical: 'bg-red-50 text-red-700 font-bold animate-pulse'
};

export const SOPChecklistManagement: React.FC<Props> = ({ user, initialTab = 'executions' }) => {
  const { templates, executions, refresh } = useSOPAndChecklists(user);

  const [activeTab, setActiveTab] = useState<'executions' | 'templates' | 'compliance'>(initialTab);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [outletFilter, setOutletFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTemplateForAssign, setSelectedTemplateForAssign] = useState<ChecklistTemplate | null>(null);
  const [activeExecutionForDetail, setActiveExecutionForDetail] = useState<ChecklistExecution | null>(null);
  const [activeTaskForEvidence, setActiveTaskForEvidence] = useState<{ execution: ChecklistExecution; task: ExecutionTaskItem } | null>(null);

  // Template Form State
  const [tplTitle, setTplTitle] = useState('');
  const [tplCategory, setTplCategory] = useState<ChecklistCategory>('Opening');
  const [tplTargetRole, setTplTargetRole] = useState<UserRole>('Chef');
  const [tplDescription, setTplDescription] = useState('');
  const [tplEstMinutes, setTplEstMinutes] = useState(25);
  const [tplTasks, setTplTasks] = useState<Array<Omit<TemplateTaskItem, 'id'>>>([
    { title: '', description: '', priority: 'Medium', requiresPhoto: false }
  ]);

  // Assign Form State
  const [assignTemplateId, setAssignTemplateId] = useState('');
  const [assignOutlet, setAssignOutlet] = useState(user.outlet || ALL_OUTLETS[0]);
  const [assignStaffName, setAssignStaffName] = useState(user.role === 'Chef' ? user.name : 'Chef Ramesh');
  const [assignStaffRole, setAssignStaffRole] = useState<UserRole>('Chef');
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split('T')[0]);

  // Evidence / Task Completion Form State
  const [evidenceRemarks, setEvidenceRemarks] = useState('');
  const [evidenceImagePreview, setEvidenceImagePreview] = useState<string | null>(null);
  const [evidenceGeo, setEvidenceGeo] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  // Manager Review Form State
  const [managerReviewNotes, setManagerReviewNotes] = useState('');

  // Permissions
  const canCreate = canCreateChecklistTemplate(user);
  const canEditDelete = canEditOrDeleteTemplate(user);
  const canAssign = canAssignChecklistToStaff(user);
  const canViewAllOutlets = canViewAllOutletChecklists(user);
  const canFillTasks = canFillOrCompleteChecklist(user);

  // Overdue calculations
  const allExecutions = getStoredExecutions();
  const overdueCountAllOutlets = useMemo(() => {
    return allExecutions.filter(ex => ex.status === 'Overdue' || ex.status === 'Escalated').length;
  }, [allExecutions]);

  const userOutletOverdueCount = useMemo(() => {
    return executions.filter(ex => ex.status === 'Overdue' || ex.status === 'Escalated').length;
  }, [executions]);

  // Filtered Executions
  const filteredExecutions = useMemo(() => {
    return executions.filter(ex => {
      if (statusFilter !== 'all' && ex.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (categoryFilter !== 'all' && ex.category !== categoryFilter) return false;
      if (outletFilter !== 'all' && ex.outlet !== outletFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ex.templateTitle.toLowerCase().includes(q);
        const matchOutlet = ex.outlet.toLowerCase().includes(q);
        const matchStaff = (ex.assignedUserName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchOutlet && !matchStaff) return false;
      }
      return true;
    });
  }, [executions, statusFilter, categoryFilter, outletFilter, searchQuery]);

  // Multi-outlet compliance stats (for Super Admin & Owner)
  const outletComplianceStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; inProgress: number; overdue: number; rate: number }> = {};
    ALL_OUTLETS.forEach(outlet => {
      stats[outlet] = { total: 0, completed: 0, inProgress: 0, overdue: 0, rate: 0 };
    });

    allExecutions.forEach(ex => {
      if (!stats[ex.outlet]) {
        stats[ex.outlet] = { total: 0, completed: 0, inProgress: 0, overdue: 0, rate: 0 };
      }
      stats[ex.outlet].total += 1;
      if (ex.status === 'Completed') stats[ex.outlet].completed += 1;
      else if (ex.status === 'In Progress') stats[ex.outlet].inProgress += 1;
      else if (ex.status === 'Overdue' || ex.status === 'Escalated') stats[ex.outlet].overdue += 1;
    });

    Object.keys(stats).forEach(outlet => {
      const s = stats[outlet];
      s.rate = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 100;
    });

    return stats;
  }, [allExecutions]);

  // Open Template Modal for editing or creating
  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setTplTitle('');
    setTplCategory('Opening');
    setTplTargetRole('Chef');
    setTplDescription('');
    setTplEstMinutes(25);
    setTplTasks([{ title: '', description: '', priority: 'Medium', requiresPhoto: false }]);
    setIsCreateTemplateOpen(true);
  };

  const handleOpenEditTemplate = (tpl: ChecklistTemplate) => {
    setEditingTemplate(tpl);
    setTplTitle(tpl.title);
    setTplCategory(tpl.category);
    setTplTargetRole(tpl.targetRole || 'Chef');
    setTplDescription(tpl.description || '');
    setTplEstMinutes(tpl.estimatedDurationMins || 25);
    setTplTasks(tpl.tasks.map(t => ({
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      requiresPhoto: t.requiresPhoto || false
    })));
    setIsCreateTemplateOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplTitle.trim()) return;

    const validTasks = tplTasks.filter(t => t.title.trim() !== '');
    if (validTasks.length === 0) {
      alert('Please add at least one task checkpoint.');
      return;
    }

    try {
      if (editingTemplate) {
        updateChecklistTemplate(user, editingTemplate.id, {
          title: tplTitle,
          category: tplCategory,
          targetRole: tplTargetRole,
          description: tplDescription,
          estimatedDurationMins: tplEstMinutes,
          tasks: validTasks.map((t, idx) => ({
            ...t,
            id: `task-${Date.now()}-${idx}`
          }))
        });
      } else {
        createChecklistTemplate(user, {
          title: tplTitle,
          category: tplCategory,
          targetRole: tplTargetRole,
          description: tplDescription,
          estimatedDurationMins: tplEstMinutes,
          tasks: validTasks.map((t, idx) => ({
            ...t,
            id: `task-${Date.now()}-${idx}`
          }))
        });
      }

      setIsCreateTemplateOpen(false);
      refresh();
    } catch (err: any) {
      alert(err.message || 'Error saving template');
    }
  };

  const handleDeleteTemplate = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete template "${title}"?`)) {
      try {
        deleteChecklistTemplate(user, id);
        refresh();
      } catch (err: any) {
        alert(err.message || 'Error deleting template');
      }
    }
  };

  // Open Assign Modal
  const handleOpenAssignModal = (tpl?: ChecklistTemplate) => {
    if (tpl) {
      setSelectedTemplateForAssign(tpl);
      setAssignTemplateId(tpl.id);
    } else if (templates.length > 0) {
      setSelectedTemplateForAssign(templates[0]);
      setAssignTemplateId(templates[0].id);
    }
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const tpl = templates.find(t => t.id === assignTemplateId) || selectedTemplateForAssign;
    if (!tpl) return;

    try {
      assignChecklistToShift(user, {
        templateId: tpl.id,
        outlet: canViewAllOutlets ? assignOutlet : (user.outlet || assignOutlet),
        assignedUserName: assignStaffName,
        assignedRole: assignStaffRole,
        shiftDate: assignDate
      });

      setIsAssignModalOpen(false);
      refresh();
    } catch (err: any) {
      alert(err.message || 'Error assigning checklist');
    }
  };

  // Start Evidence Modal for Chef
  const handleOpenEvidenceUpload = (execution: ChecklistExecution, task: ExecutionTaskItem) => {
    setActiveTaskForEvidence({ execution, task });
    setEvidenceRemarks(task.remarks || '');
    setEvidenceImagePreview(task.evidence?.storagePath || null);
    setEvidenceGeo(task.evidence?.geoLat ? { lat: task.evidence.geoLat, lng: task.evidence.geoLng || 0 } : null);

    // Auto-fetch geolocation if supported
    if ('geolocation' in navigator && !task.evidence?.geoLat) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setEvidenceGeo({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        err => console.log('Geolocation skipped or denied', err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setEvidenceImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitEvidenceAndTask = () => {
    if (!activeTaskForEvidence) return;
    const { execution, task } = activeTaskForEvidence;

    setEvidenceLoading(true);
    setTimeout(() => {
      const photoUrl = evidenceImagePreview || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80';
      updateTaskProgress(
        user,
        execution.id,
        task.id,
        {
          status: 'Completed',
          remarks: evidenceRemarks || 'Photo and task compliance confirmed by chef',
          evidence: {
            id: 'ev-' + Date.now(),
            storagePath: photoUrl,
            fileType: 'image/jpeg',
            uploadedBy: user.name,
            capturedAt: new Date().toISOString(),
            geoLat: evidenceGeo?.lat || 13.0359,
            geoLng: evidenceGeo?.lng || 80.2473
          }
        }
      );

      setEvidenceLoading(false);
      setActiveTaskForEvidence(null);
      refresh();
      // Update active detail view if open
      const updated = getStoredExecutions().find(ex => ex.id === execution.id);
      if (updated) setActiveExecutionForDetail(updated);
    }, 400);
  };

  const handleQuickToggleTaskStatus = (execution: ChecklistExecution, task: ExecutionTaskItem) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    updateTaskProgress(
      user,
      execution.id,
      task.id,
      { status: nextStatus }
    );
    refresh();
    const updated = getStoredExecutions().find(ex => ex.id === execution.id);
    if (updated) setActiveExecutionForDetail(updated);
  };

  // Manager Review Actions
  const handleManagerReview = (executionId: string, action: 'Approve' | 'Escalate') => {
    const approved = action === 'Approve';
    reviewChecklistExecution(user, executionId, {
      approved,
      remarks: managerReviewNotes || (approved ? 'Verified and signed off by manager' : 'Flagged for non-compliance / incomplete proof')
    });
    setManagerReviewNotes('');
    setActiveExecutionForDetail(null);
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Outlet Overdue Alerts */}
      <div className="bg-[#14231E] text-white rounded-2xl p-6 shadow-sm border border-[#233830]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C5A880]/20 text-[#E6CA9E] border border-[#C5A880]/30">
                {user.role} Control Panel
              </span>
              {canViewAllOutlets ? (
                <span className="text-xs text-stone-300 font-medium">All 12 Mayflower Outlets</span>
              ) : (
                <span className="text-xs text-stone-300 font-medium">{user.outlet || 'Assigned Outlet'}</span>
              )}
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">Standard Operating Procedures & Checklists</h1>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Standardized kitchen, bar, safety, and hygiene workflows. Assign daily shift checklists, capture geo-tagged photo proof, and monitor cross-outlet compliance in real-time.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {canCreate && (
              <button
                onClick={handleOpenCreateTemplate}
                className="flex items-center gap-2 bg-[#C5A880] hover:bg-[#b0936b] text-[#14231E] font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Template</span>
              </button>
            )}

            {canAssign && (
              <button
                onClick={() => handleOpenAssignModal()}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-4 py-2.5 rounded-xl border border-white/20 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#C5A880]" />
                <span>+ Assign to Today's Shift</span>
              </button>
            )}

            <button
              onClick={() => refresh()}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 transition cursor-pointer"
              title="Refresh SOP Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Super Admin & Manager Overdue Alert Metric */}
        {((canViewAllOutlets && overdueCountAllOutlets > 0) || (!canViewAllOutlets && userOutletOverdueCount > 0)) && (
          <div className="mt-5 p-3.5 bg-rose-950/70 border border-rose-500/40 rounded-xl flex items-center justify-between gap-3 text-rose-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {canViewAllOutlets
                    ? `${overdueCountAllOutlets} Checklist${overdueCountAllOutlets > 1 ? 's' : ''} Overdue / Escalated Across All 12 Outlets Today`
                    : `${userOutletOverdueCount} Overdue Checklist in Your Outlet Today`}
                </p>
                <p className="text-[11px] text-rose-300/90">
                  Tasks requiring immediate review or completion to avoid food safety & hygiene breach.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('executions');
                setStatusFilter('overdue');
              }}
              className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0"
            >
              Inspect Overdue
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-[#E8E4DB] pb-1">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('executions')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'executions'
                ? 'bg-[#14231E] text-[#C5A880] shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Live Shift Executions ({executions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-[#14231E] text-[#C5A880] shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Checklist Templates ({templates.length})</span>
          </button>

          {canViewAllOutlets && (
            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'compliance'
                  ? 'bg-[#14231E] text-[#C5A880] shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Multi-Outlet Compliance (12 Outlets)</span>
            </button>
          )}
        </div>

        {/* Global Summary Badge */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            {executions.filter(e => e.status === 'Completed').length} Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            {executions.filter(e => e.status === 'In Progress').length} In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            {executions.filter(e => e.status === 'Overdue' || e.status === 'Escalated').length} Overdue
          </span>
        </div>
      </div>

      {/* ─── TAB 1: LIVE SHIFT EXECUTIONS ─── */}
      {activeTab === 'executions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-[#E8E4DB] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title, staff or outlet..."
                className="px-3.5 py-1.5 bg-[#F9F8F5] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C5A880] w-64"
              />

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#F9F8F5] border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-[#C5A880]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="escalated">Escalated</option>
              </select>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#F9F8F5] border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-[#C5A880]"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {canViewAllOutlets && (
                <select
                  value={outletFilter}
                  onChange={e => setOutletFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#F9F8F5] border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-[#C5A880]"
                >
                  <option value="all">All Outlets (12)</option>
                  {ALL_OUTLETS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="text-xs text-stone-500 font-medium">
              Showing {filteredExecutions.length} of {executions.length} shift checklists
            </div>
          </div>

          {/* Executions Grid / List */}
          {filteredExecutions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#D6D0C2] p-12 text-center">
              <ClipboardList className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif text-base font-semibold text-stone-800">No shift checklists found</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                No active checklist matches the selected filters. Use "+ Assign to Today's Shift" to schedule a new shift checklist.
              </p>
              {canAssign && (
                <button
                  onClick={() => handleOpenAssignModal()}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-[#14231E] text-[#C5A880] px-4 py-2 rounded-xl hover:bg-[#1f352e] transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign First Shift Checklist
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExecutions.map(exec => {
                const completedTasksCount = exec.tasks.filter(t => t.status === 'Completed').length;
                const totalTasksCount = exec.tasks.length;
                const progressPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
                const isOverdue = exec.status === 'Overdue' || exec.status === 'Escalated';
                const hasEvidenceSubmitted = exec.tasks.some(t => !!t.evidence);

                return (
                  <div
                    key={exec.id}
                    className={`bg-white rounded-2xl border p-5 flex flex-col justify-between gap-4 transition hover:shadow-md ${
                      isOverdue
                        ? 'border-rose-300 bg-rose-50/20'
                        : exec.status === 'Completed'
                        ? 'border-emerald-200'
                        : 'border-[#E8E4DB]'
                    }`}
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${CATEGORY_COLORS[exec.category] || 'bg-stone-50 text-stone-700'}`}>
                          {exec.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            exec.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : exec.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {exec.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-[#14231E] leading-snug">{exec.templateTitle}</h3>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3 text-[#C5A880]" />
                        <span className="truncate">{exec.outlet}</span>
                      </p>
                    </div>

                    {/* Progress Bar & Shift Meta */}
                    <div className="space-y-2 bg-[#F9F8F5] p-3 rounded-xl border border-stone-200/70 text-xs">
                      <div className="flex items-center justify-between text-stone-600 font-medium">
                        <span className="flex items-center gap-1.5">
                          <ChefHat className="w-3.5 h-3.5 text-stone-500" />
                          <span>{exec.assignedUserName || 'Staff'} ({exec.assignedRole})</span>
                        </span>
                        <span className="font-bold text-stone-800">{completedTasksCount}/{totalTasksCount} done</span>
                      </div>

                      {/* Progress line */}
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isOverdue
                              ? 'bg-rose-500'
                              : progressPct === 100
                              ? 'bg-emerald-500'
                              : 'bg-[#C5A880]'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Shift Date {exec.shiftDate}
                        </span>
                        <span className="font-medium text-stone-600">{exec.assignedRole}</span>
                      </div>
                    </div>

                    {/* Evidence Indicators & Actions */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                        {hasEvidenceSubmitted ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Camera className="w-3 h-3" /> Geo-Proof Uploaded
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-stone-400">
                            <Camera className="w-3 h-3" /> Photo Required
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setActiveExecutionForDetail(exec)}
                        className="flex items-center gap-1 text-xs font-bold bg-[#14231E] hover:bg-[#233830] text-[#C5A880] px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        <span>{user.role === 'Chef' ? 'Execute Tasks' : 'Review'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: CHECKLIST TEMPLATES CATALOG ─── */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-xl border border-[#E8E4DB] p-4 shadow-xs">
            <div>
              <h2 className="font-serif text-base font-bold text-[#14231E]">Standardized SOP Templates Catalog</h2>
              <p className="text-xs text-stone-500">Master templates designed by Admin / Super Admin for kitchen, bar, hygiene and opening shifts</p>
            </div>
            {canCreate && (
              <button
                onClick={handleOpenCreateTemplate}
                className="flex items-center gap-1.5 bg-[#14231E] hover:bg-[#233830] text-[#C5A880] text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create New Template</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(tpl => (
              <div key={tpl.id} className="bg-white rounded-2xl border border-[#E8E4DB] p-5 flex flex-col justify-between gap-4 transition hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${CATEGORY_COLORS[tpl.category] || 'bg-stone-50 text-stone-700'}`}>
                      {tpl.category}
                    </span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {tpl.estimatedDurationMins || 25} mins
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#14231E]">{tpl.title}</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">{tpl.description}</p>
                </div>

                {/* Tasks preview list */}
                <div className="bg-[#F9F8F5] rounded-xl p-3 border border-stone-200/70 space-y-1.5">
                  <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                    <span>{tpl.tasks.length} Checkpoints</span>
                    <span className="text-[10px] text-stone-400">By {tpl.createdBy}</span>
                  </div>
                  <ul className="text-xs text-stone-600 space-y-1">
                    {tpl.tasks.slice(0, 3).map((t, i) => (
                      <li key={t.id || i} className="flex items-center gap-2 truncate">
                        <CheckSquare className="w-3 h-3 text-[#C5A880] shrink-0" />
                        <span className="truncate">{t.title}</span>
                        {t.requiresPhoto && <Camera className="w-2.5 h-2.5 text-stone-400 shrink-0" />}
                      </li>
                    ))}
                    {tpl.tasks.length > 3 && (
                      <li className="text-[10px] text-stone-400 italic">
                        +{tpl.tasks.length - 3} more checkpoints in this checklist
                      </li>
                    )}
                  </ul>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {canEditDelete && (
                      <>
                        <button
                          onClick={() => handleOpenEditTemplate(tpl)}
                          className="p-1.5 text-stone-500 hover:text-[#14231E] hover:bg-stone-100 rounded-lg transition cursor-pointer"
                          title="Edit Template"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {canAssign && (
                    <button
                      onClick={() => handleOpenAssignModal(tpl)}
                      className="flex items-center gap-1.5 text-xs font-bold bg-[#C5A880] hover:bg-[#b0936b] text-[#14231E] px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Assign to Shift</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: MULTI-OUTLET COMPLIANCE OVERVIEW (SUPER ADMIN & OWNER) ─── */}
      {activeTab === 'compliance' && canViewAllOutlets && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E8E4DB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h2 className="font-serif text-base font-bold text-[#14231E]">Multi-Outlet SOP Compliance Matrix</h2>
              <p className="text-xs text-stone-500">Live operational audit & checklist completion health across all 12 sanctuary outlets</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-xl">
                12 Active Outlets Monitored
              </span>
            </div>
          </div>

          {/* Compliance Table */}
          <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#14231E] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Outlet Venue</th>
                    <th className="py-3.5 px-4 font-bold text-center">Total Shifts</th>
                    <th className="py-3.5 px-4 font-bold text-center">Completed</th>
                    <th className="py-3.5 px-4 font-bold text-center">In Progress</th>
                    <th className="py-3.5 px-4 font-bold text-center">Overdue / Escalated</th>
                    <th className="py-3.5 px-4 font-bold text-center">Compliance Rate</th>
                    <th className="py-3.5 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {ALL_OUTLETS.map(outletName => {
                    const stat = outletComplianceStats[outletName] || { total: 0, completed: 0, inProgress: 0, overdue: 0, rate: 100 };
                    const hasIssues = stat.overdue > 0;

                    return (
                      <tr key={outletName} className={`hover:bg-[#F9F8F5] transition ${hasIssues ? 'bg-rose-50/30' : ''}`}>
                        <td className="py-3.5 px-4 font-bold text-[#14231E] flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#C5A880] shrink-0" />
                          <span>{outletName}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium">{stat.total}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                          {stat.completed}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-amber-700">
                          {stat.inProgress}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">
                          {stat.overdue > 0 ? (
                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-bold">
                              <AlertTriangle className="w-3 h-3" /> {stat.overdue} Overdue
                            </span>
                          ) : (
                            <span className="text-stone-400">0</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`font-bold ${stat.rate >= 90 ? 'text-emerald-700' : stat.rate >= 70 ? 'text-amber-700' : 'text-rose-700'}`}>
                              {stat.rate}%
                            </span>
                            <div className="w-16 bg-stone-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full ${stat.rate >= 90 ? 'bg-emerald-500' : stat.rate >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${stat.rate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setOutletFilter(outletName);
                              setActiveTab('executions');
                            }}
                            className="text-[11px] font-bold text-[#14231E] hover:text-[#C5A880] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            View Shifts <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE / EDIT TEMPLATE ─── */}
      {isCreateTemplateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200">
            {/* Modal Header */}
            <div className="bg-[#14231E] text-white p-5 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold">
                  {editingTemplate ? 'Edit Checklist Template' : 'Design New SOP Checklist Template'}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">Admin standard template configuration with multi-task checkpoints</p>
              </div>
              <button
                onClick={() => setIsCreateTemplateOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTemplate} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Template Title *</label>
                  <input
                    type="text"
                    required
                    value={tplTitle}
                    onChange={e => setTplTitle(e.target.value)}
                    placeholder="e.g. Kitchen Opening Checklist"
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#14231E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    value={tplCategory}
                    onChange={e => setTplCategory(e.target.value as ChecklistCategory)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#14231E]"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Description / SOP Scope</label>
                  <input
                    type="text"
                    value={tplDescription}
                    onChange={e => setTplDescription(e.target.value)}
                    placeholder="Standardized opening protocol before service begins..."
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#14231E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Est. Duration (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={tplEstMinutes}
                    onChange={e => setTplEstMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#14231E]"
                  />
                </div>
              </div>

              {/* Dynamic Task Items */}
              <div className="pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Checkpoints / Tasks ({tplTasks.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setTplTasks(prev => [...prev, { title: '', description: '', priority: 'Medium', requiresPhoto: false }])}
                    className="text-xs font-bold text-[#14231E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Checkpoint
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {tplTasks.map((task, idx) => (
                    <div key={idx} className="bg-[#F9F8F5] p-3 rounded-xl border border-stone-200 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#14231E] text-[#C5A880] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          value={task.title}
                          onChange={e => {
                            const copy = [...tplTasks];
                            copy[idx].title = e.target.value;
                            setTplTasks(copy);
                          }}
                          placeholder="Task title (e.g. Inspect walk-in cooler temperature)"
                          className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-none"
                        />
                        {tplTasks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTplTasks(tplTasks.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pl-7 text-xs">
                        <select
                          value={task.priority}
                          onChange={e => {
                            const copy = [...tplTasks];
                            copy[idx].priority = e.target.value as ChecklistTaskPriority;
                            setTplTasks(copy);
                          }}
                          className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-[11px] text-stone-700"
                        >
                          <option value="Low">Low Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="High">High Priority</option>
                          <option value="Critical">Critical Priority</option>
                        </select>

                        <label className="flex items-center gap-1.5 text-stone-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={task.requiresPhoto}
                            onChange={e => {
                              const copy = [...tplTasks];
                              copy[idx].requiresPhoto = e.target.checked;
                              setTplTasks(copy);
                            }}
                            className="rounded text-[#14231E] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="flex items-center gap-1 text-[11px] font-medium">
                            <Camera className="w-3 h-3 text-[#C5A880]" /> Require Geo Photo Proof
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTemplateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#14231E] hover:bg-[#233830] text-[#C5A880] rounded-xl transition shadow-xs cursor-pointer"
                >
                  {editingTemplate ? 'Save Template Changes' : 'Create SOP Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ASSIGN TO TODAY'S SHIFT ─── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 flex flex-col">
            <div className="bg-[#14231E] text-white p-5 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold">Assign Checklist to Shift</h3>
                <p className="text-xs text-stone-300 mt-0.5">Deploy SOP template to duty staff & outlet</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Select Checklist Template *</label>
                <select
                  value={assignTemplateId}
                  onChange={e => setAssignTemplateId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#14231E]"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.category} — {t.tasks.length} tasks)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Outlet Location *</label>
                  {canViewAllOutlets ? (
                    <select
                      value={assignOutlet}
                      onChange={e => setAssignOutlet(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none"
                    >
                      {ALL_OUTLETS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value={user.outlet || 'Anna Nagar Flagship Solarium'}
                      className="w-full px-3.5 py-2 bg-stone-100 border border-stone-300 rounded-xl text-xs text-stone-600 font-medium"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Staff Role *</label>
                  <select
                    value={assignStaffRole}
                    onChange={e => setAssignStaffRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none"
                  >
                    <option value="Chef">Chef</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Assignee Staff Name *</label>
                  <input
                    type="text"
                    required
                    value={assignStaffName}
                    onChange={e => setAssignStaffName(e.target.value)}
                    placeholder="e.g. Chef Ramesh"
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Shift Date *</label>
                  <input
                    type="date"
                    required
                    value={assignDate}
                    onChange={e => setAssignDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#14231E] hover:bg-[#233830] text-[#C5A880] rounded-xl transition shadow-xs cursor-pointer"
                >
                  Confirm & Deploy Shift Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: EXECUTION DETAIL & TASK RUNNER / MANAGER REVIEW ─── */}
      {activeExecutionForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200">
            {/* Header */}
            <div className="bg-[#14231E] text-white p-5 rounded-t-2xl flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[activeExecutionForDetail.category] || 'bg-stone-50 text-stone-700'}`}>
                    {activeExecutionForDetail.category}
                  </span>
                  <span className="text-xs text-[#C5A880] font-semibold">{activeExecutionForDetail.assignedRole} Duty</span>
                </div>
                <h3 className="font-serif text-xl font-bold">{activeExecutionForDetail.templateTitle}</h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  {activeExecutionForDetail.outlet} · Assigned to {activeExecutionForDetail.assignedUserName || 'Staff'} ({activeExecutionForDetail.assignedRole})
                </p>
              </div>
              <button
                onClick={() => setActiveExecutionForDetail(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Status Header Bar */}
              <div className="bg-[#F9F8F5] p-4 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-stone-500">Status: </span>
                  <span className="font-bold text-stone-900 uppercase tracking-wide ml-1">{activeExecutionForDetail.status}</span>
                </div>
                <div>
                  <span className="text-stone-500">Shift Date: </span>
                  <span className="font-medium text-stone-800 ml-1">{activeExecutionForDetail.shiftDate}</span>
                </div>
                <div>
                  <span className="text-stone-500">Assigned By: </span>
                  <span className="font-bold text-stone-900 ml-1">{activeExecutionForDetail.assignedBy}</span>
                </div>
                {activeExecutionForDetail.reviewedBy && (
                  <div className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Signed off by {activeExecutionForDetail.reviewedBy}
                  </div>
                )}
              </div>

              {/* Task Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Checkpoints & Evidence Submissions</h4>

                {activeExecutionForDetail.tasks.map((task, idx) => {
                  const isDone = task.status === 'Completed';

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition ${
                        isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            disabled={!canFillTasks && user.role !== 'Admin' && user.role !== 'SuperAdmin'}
                            onClick={() => handleQuickToggleTaskStatus(activeExecutionForDetail, task)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                              isDone ? 'bg-emerald-600 text-white' : 'border-2 border-stone-300 hover:border-stone-500'
                            }`}
                          >
                            {isDone && <CheckCircle2 className="w-4 h-4" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#14231E]">
                                {idx + 1}. {task.title}
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full ${PRIORITY_BADGES[task.priority]}`}>
                                {task.priority}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-[11px] text-stone-500 mt-0.5">{task.description}</p>
                            )}

                            {/* Evidence Info if present */}
                            {task.evidence && (
                              <div className="mt-2.5 p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-start gap-3">
                                {task.evidence.storagePath && (
                                  <img
                                    src={task.evidence.storagePath}
                                    alt="Evidence"
                                    className="w-14 h-14 rounded-lg object-cover border border-stone-300 shrink-0"
                                  />
                                )}
                                <div className="text-[11px] text-stone-600 space-y-0.5">
                                  <p className="font-semibold text-stone-800">{task.remarks || 'Photo verified'}</p>
                                  {task.evidence.geoLat && (
                                    <p className="text-[10px] text-emerald-700 flex items-center gap-1 font-mono">
                                      <MapPin className="w-3 h-3" /> GPS: {task.evidence.geoLat.toFixed(4)}, {task.evidence.geoLng?.toFixed(4)}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-stone-400">
                                    Captured {new Date(task.evidence.capturedAt).toLocaleTimeString()} by {task.completedBy || activeExecutionForDetail.assignedUserName || 'Chef'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Evidence Upload Button for Chef / Staff */}
                        {task.requiresPhoto && (
                          <button
                            onClick={() => handleOpenEvidenceUpload(activeExecutionForDetail, task)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
                              task.evidence
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-[#14231E] text-[#C5A880] border-[#14231E] hover:bg-[#233830]'
                            }`}
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{task.evidence ? 'Update Photo' : 'Upload Evidence'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Manager Review Controls */}
              {(user.role === 'Manager' || user.role === 'Admin' || user.role === 'SuperAdmin') && (
                <div className="bg-[#14231E] text-white p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#C5A880] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Manager Inspection & Sign-off
                    </h5>
                    <span className="text-[11px] text-stone-300">Reviewed by {user.name}</span>
                  </div>

                  <input
                    type="text"
                    value={managerReviewNotes}
                    onChange={e => setManagerReviewNotes(e.target.value)}
                    placeholder="Enter manager notes (e.g. Temperature checked & verified on pass)..."
                    className="w-full px-3.5 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none"
                  />

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleManagerReview(activeExecutionForDetail.id, 'Escalate')}
                      className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Flag / Escalate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleManagerReview(activeExecutionForDetail.id, 'Approve')}
                      className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Sign Off</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl flex items-center justify-end">
              <button
                onClick={() => setActiveExecutionForDetail(null)}
                className="px-5 py-2 text-xs font-bold bg-stone-800 hover:bg-stone-900 text-white rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: PHOTO EVIDENCE & GEO CAPTURE MODAL ─── */}
      {activeTaskForEvidence && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 flex flex-col">
            <div className="bg-[#14231E] text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#C5A880]" />
                <h4 className="font-bold text-sm">Upload Photo Evidence</h4>
              </div>
              <button
                onClick={() => setActiveTaskForEvidence(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-stone-800">{activeTaskForEvidence.task.title}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Capture photo of temperature probe, clean prep station, or food storage.</p>
              </div>

              {/* Photo Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">Photo Proof *</label>
                {evidenceImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-stone-300">
                    <img src={evidenceImagePreview} alt="Preview" className="w-full h-44 object-cover" />
                    <button
                      type="button"
                      onClick={() => setEvidenceImagePreview(null)}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-stone-300 hover:border-[#14231E] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-stone-50 hover:bg-stone-100 transition">
                    <Camera className="w-8 h-8 text-stone-400" />
                    <span className="text-xs font-bold text-stone-700">Take Photo or Browse Image</span>
                    <span className="text-[10px] text-stone-400">JPG, PNG (Supports Mobile Camera)</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Geo Location Badge */}
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>GPS Geotag:</span>
                </span>
                {evidenceGeo ? (
                  <span className="font-mono text-[11px] text-emerald-800 font-bold">
                    {evidenceGeo.lat.toFixed(4)}, {evidenceGeo.lng.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400">Auto-detecting GPS...</span>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Chef Remarks / Reading *</label>
                <input
                  type="text"
                  value={evidenceRemarks}
                  onChange={e => setEvidenceRemarks(e.target.value)}
                  placeholder="e.g. Temperature logged at 3.2°C — within HACCP limit"
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTaskForEvidence(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={evidenceLoading}
                  onClick={handleSubmitEvidenceAndTask}
                  className="px-5 py-2 text-xs font-bold bg-[#14231E] hover:bg-[#233830] text-[#C5A880] rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{evidenceLoading ? 'Saving...' : 'Submit Evidence & Complete Task'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOPChecklistManagement;
