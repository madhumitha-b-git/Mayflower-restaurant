import { useState, useEffect } from 'react';
import {
  UserProfile,
  ChecklistTemplate,
  ChecklistExecution,
  ChecklistTaskStatus,
  ExecutionTaskItem,
  ExecutionTaskEvidence,
} from '../types';
import {
  canCreateChecklistTemplate,
  canEditOrDeleteTemplate,
  canAssignChecklistToStaff,
  canViewAllOutletChecklists,
  canViewOwnOutletChecklists,
  canFillOrCompleteChecklist,
} from '../rbac/policies';

const TEMPLATES_KEY = 'mayflower_sop_templates_v1';
const EXECUTIONS_KEY = 'mayflower_sop_executions_v1';
const SOP_UPDATE_EVENT = 'mayflower_sop_updated';

const TODAY_STR = new Date().toISOString().split('T')[0];

export const INITIAL_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'tmpl-kitchen-open',
    title: 'Kitchen Opening Checklist',
    category: 'Opening',
    description: 'Essential morning culinary and hygiene line verification before first lunch order.',
    targetRole: 'Chef',
    createdBy: 'Karthik Admin',
    createdAt: '2026-09-01T06:00:00.000Z',
    updatedAt: '2026-09-20T08:00:00.000Z',
    tasks: [
      {
        id: 't-1',
        title: 'Walk-in Cooler & Freezer Temp Log (< 3.5°C)',
        description: 'Verify digital gauge and manual probe temperature. Log reading.',
        priority: 'Critical',
        requiresPhoto: true,
      },
      {
        id: 't-2',
        title: 'Sanitize Prep Stations, Poly-boards & Handwash Sinks',
        description: 'Wipe all food contact surfaces with approved food-grade sanitizer.',
        priority: 'High',
        requiresPhoto: false,
      },
      {
        id: 't-3',
        title: 'Inspect Deep Fryer Oil Quality & TPM Gauge (< 24%)',
        description: 'Check oil clarity, sediment level, and calibrate heating element.',
        priority: 'High',
        requiresPhoto: true,
      },
      {
        id: 't-4',
        title: 'Calibrate Meat Thermometers & Probe Sanitization',
        description: 'Ice bath calibration test to ensure 0.0°C ± 0.5°C accuracy.',
        priority: 'Medium',
        requiresPhoto: false,
      },
      {
        id: 't-5',
        title: 'Verify Knife Station Sanitization & Safety Guards',
        description: 'Inspect chef knives in UV sanitizer cabinet and verify safety gloves.',
        priority: 'Medium',
        requiresPhoto: false,
      },
      {
        id: 't-6',
        title: 'Morning Mise en Place & Fresh Herbs Stock Verification',
        description: 'Inspect chopped aromatics, microgreens, and sauces prepared for lunch shift.',
        priority: 'High',
        requiresPhoto: true,
      },
    ],
  },
  {
    id: 'tmpl-kitchen-close',
    title: 'Evening Kitchen Closing & Deep Clean',
    category: 'Closing',
    description: 'End of shift sanitation, power shutdown, and safe food storage protocol.',
    targetRole: 'Chef',
    createdBy: 'Karthik Admin',
    createdAt: '2026-09-01T06:00:00.000Z',
    updatedAt: '2026-09-20T08:00:00.000Z',
    tasks: [
      {
        id: 'tc-1',
        title: 'Label & Date-stamp All Opened Perishables in Walk-in',
        description: 'FIFO adherence: color-coded day dots and allergen separation.',
        priority: 'Critical',
        requiresPhoto: true,
      },
      {
        id: 'tc-2',
        title: 'Degrease & Scrub Flat-top Griddle, Range Burners & Ovens',
        description: 'Heavy duty degreaser treatment and clean grill surface wipe down.',
        priority: 'High',
        requiresPhoto: true,
      },
      {
        id: 'tc-3',
        title: 'Power Down Main Exhaust Hoods & Gas Master Solenoid',
        description: 'Mandatory fire prevention checklist and safety shutoff.',
        priority: 'Critical',
        requiresPhoto: false,
      },
      {
        id: 'tc-4',
        title: 'Trash Bin Sanitization & Waste Liners Renewal',
        description: 'Empty all kitchen bins into external compactor and wash liners.',
        priority: 'Medium',
        requiresPhoto: true,
      },
      {
        id: 'tc-5',
        title: 'Sanitizer Buckets Drain & Mop Station Chemical Replenish',
        description: 'Empty dirty wash water and prepare fresh microfiber heads for morning.',
        priority: 'Medium',
        requiresPhoto: false,
      },
      {
        id: 'tc-6',
        title: 'Lock Walk-in Cooler & Handover Key to Night Manager',
        description: 'Verify all refrigeration doors are sealed tight and padlocked.',
        priority: 'High',
        requiresPhoto: false,
      },
    ],
  },
  {
    id: 'tmpl-haccp-hygiene',
    title: 'Food Safety & HACCP Hygiene Protocol',
    category: 'Hygiene',
    description: 'Daily multi-point cross-contamination audit and personal hygiene adherence.',
    targetRole: 'Chef',
    createdBy: 'Sanjay Admin',
    createdAt: '2026-09-05T06:00:00.000Z',
    updatedAt: '2026-09-21T08:00:00.000Z',
    tasks: [
      {
        id: 'th-1',
        title: 'Chef Uniform, Hair Net & Handwash Sink Paper Towel Check',
        description: 'Pristine chef whites, aprons, and soap dispenser levels.',
        priority: 'High',
        requiresPhoto: false,
      },
      {
        id: 'th-2',
        title: 'Raw Seafood & Poultry Storage Separation Check',
        description: 'Seafood stored below 2°C in designated blue bins away from cooked meats.',
        priority: 'Critical',
        requiresPhoto: true,
      },
      {
        id: 'th-3',
        title: 'Line Sanitizer Bucket Chlorine/Quat PPM Test',
        description: 'Dip test strip in active sanitizer bucket (Target: 200 PPM).',
        priority: 'High',
        requiresPhoto: true,
      },
      {
        id: 'th-4',
        title: 'Dishwasher Final Rinse Temp Log (> 82°C)',
        description: 'Verify thermal sanitization dial during lunch cycle.',
        priority: 'High',
        requiresPhoto: true,
      },
      {
        id: 'th-5',
        title: 'Dry Store Pest Barrier & Airtight Container Seal Inspection',
        description: 'Inspect dry storage pallets, flour bins, and insect light traps.',
        priority: 'Medium',
        requiresPhoto: false,
      },
    ],
  },
  {
    id: 'tmpl-bar-beverage',
    title: 'Bar & Beverage Station Opening',
    category: 'Bar',
    description: 'Cold brew taps, glassware sanitation, citrus prep, and cellar stock check.',
    targetRole: 'Chef',
    createdBy: 'Karthik Admin',
    createdAt: '2026-09-08T06:00:00.000Z',
    updatedAt: '2026-09-21T08:00:00.000Z',
    tasks: [
      {
        id: 'tb-1',
        title: 'Ice Machine Cleanliness & Scoop Sanitizer Holder Check',
        description: 'Ensure ice bin is free of debris and scoop is stored in sanitized holder.',
        priority: 'High',
        requiresPhoto: true,
      },
      {
        id: 'tb-2',
        title: 'Cold Brew Nitrogen Tap Pressure & Flush Verification',
        description: 'Purge lines with fresh cold brew and calibrate regulator to 35 PSI.',
        priority: 'Medium',
        requiresPhoto: false,
      },
      {
        id: 'tb-3',
        title: 'Fresh Citrus Garnishes & Infused Syrups Mise en Place',
        description: 'Slice organic dehydrated oranges, mint leaves, and lavender syrup.',
        priority: 'Medium',
        requiresPhoto: true,
      },
      {
        id: 'tb-4',
        title: 'Glassware Steam Polish & Chip-Free Inspection',
        description: 'Inspect Riedel wine glasses and highball tumblers for blemishes.',
        priority: 'High',
        requiresPhoto: false,
      },
    ],
  },
];

export const INITIAL_EXECUTIONS: ChecklistExecution[] = [
  {
    id: 'exec-today-annanagar',
    templateId: 'tmpl-kitchen-open',
    templateTitle: 'Kitchen Opening Checklist',
    category: 'Opening',
    outlet: 'Anna Nagar',
    assignedUserId: 'usr-chef-1',
    assignedUserName: 'Chef Rajesh Sharma',
    assignedRole: 'Chef',
    shiftDate: TODAY_STR,
    status: 'In Progress',
    assignedBy: 'Vikram Seth (Manager)',
    assignedAt: `${TODAY_STR}T07:30:00.000Z`,
    tasks: [
      {
        id: 't-1',
        title: 'Walk-in Cooler & Freezer Temp Log (< 3.5°C)',
        description: 'Verify digital gauge and manual probe temperature. Log reading.',
        priority: 'Critical',
        requiresPhoto: true,
        status: 'Completed',
        completedAt: `${TODAY_STR}T08:15:00.000Z`,
        completedBy: 'Chef Rajesh Sharma',
        remarks: 'Digital gauge logged at 3.2°C — within optimal safe zone.',
        evidence: {
          id: 'ev-1',
          storagePath: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
          fileType: 'image/jpeg',
          uploadedBy: 'Chef Rajesh Sharma',
          geoLat: 13.085,
          geoLng: 80.218,
          capturedAt: `${TODAY_STR}T08:14:00.000Z`,
        },
      },
      {
        id: 't-2',
        title: 'Sanitize Prep Stations, Poly-boards & Handwash Sinks',
        description: 'Wipe all food contact surfaces with approved food-grade sanitizer.',
        priority: 'High',
        requiresPhoto: false,
        status: 'Completed',
        completedAt: `${TODAY_STR}T08:25:00.000Z`,
        completedBy: 'Chef Rajesh Sharma',
        remarks: 'Quat sanitizer wipe applied on both prep lines.',
      },
      {
        id: 't-3',
        title: 'Inspect Deep Fryer Oil Quality & TPM Gauge (< 24%)',
        description: 'Check oil clarity, sediment level, and calibrate heating element.',
        priority: 'High',
        requiresPhoto: true,
        status: 'In Progress',
        remarks: 'Heating element on; testing oil test strip currently.',
      },
      {
        id: 't-4',
        title: 'Calibrate Meat Thermometers & Probe Sanitization',
        description: 'Ice bath calibration test to ensure 0.0°C ± 0.5°C accuracy.',
        priority: 'Medium',
        requiresPhoto: false,
        status: 'Pending',
      },
      {
        id: 't-5',
        title: 'Verify Knife Station Sanitization & Safety Guards',
        description: 'Inspect chef knives in UV sanitizer cabinet and verify safety gloves.',
        priority: 'Medium',
        requiresPhoto: false,
        status: 'Pending',
      },
      {
        id: 't-6',
        title: 'Morning Mise en Place & Fresh Herbs Stock Verification',
        description: 'Inspect chopped aromatics, microgreens, and sauces prepared for lunch shift.',
        priority: 'High',
        requiresPhoto: true,
        status: 'Pending',
      },
    ],
  },
  {
    id: 'exec-today-poes-done',
    templateId: 'tmpl-kitchen-open',
    templateTitle: 'Kitchen Opening Checklist',
    category: 'Opening',
    outlet: 'Poes Garden',
    assignedUserId: 'usr-chef-2',
    assignedUserName: 'Chef Kavita Menon',
    assignedRole: 'Chef',
    shiftDate: TODAY_STR,
    status: 'Completed',
    assignedBy: 'Priya Sundaram (Manager)',
    assignedAt: `${TODAY_STR}T07:00:00.000Z`,
    completedAt: `${TODAY_STR}T08:45:00.000Z`,
    reviewedBy: 'Priya Sundaram (Manager)',
    reviewedAt: `${TODAY_STR}T09:00:00.000Z`,
    reviewRemarks: 'All 6 tasks verified and photos checked. Flawless setup.',
    tasks: [
      {
        id: 't-1',
        title: 'Walk-in Cooler & Freezer Temp Log (< 3.5°C)',
        description: 'Verify digital gauge and manual probe temperature. Log reading.',
        priority: 'Critical',
        requiresPhoto: true,
        status: 'Completed',
        completedAt: `${TODAY_STR}T07:45:00.000Z`,
        completedBy: 'Chef Kavita Menon',
        remarks: 'Cooler at 2.9°C, Freezer at -19°C.',
        evidence: {
          id: 'ev-2',
          storagePath: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
          fileType: 'image/jpeg',
          uploadedBy: 'Chef Kavita Menon',
          geoLat: 13.036,
          geoLng: 80.247,
          capturedAt: `${TODAY_STR}T07:44:00.000Z`,
        },
      },
      {
        id: 't-2',
        title: 'Sanitize Prep Stations, Poly-boards & Handwash Sinks',
        description: 'Wipe all food contact surfaces with approved food-grade sanitizer.',
        priority: 'High',
        requiresPhoto: false,
        status: 'Completed',
        completedAt: `${TODAY_STR}T08:00:00.000Z`,
        completedBy: 'Chef Kavita Menon',
        remarks: 'Stainless counters bleached & rinsed.',
      },
      {
        id: 't-3',
        title: 'Inspect Deep Fryer Oil Quality & TPM Gauge (< 24%)',
        description: 'Check oil clarity, sediment level, and calibrate heating element.',
        priority: 'High',
        requiresPhoto: true,
        status: 'Completed',
        completedAt: `${TODAY_STR}T08:15:00.000Z`,
        completedBy: 'Chef Kavita Menon',
        remarks: 'Fresh canola oil batch filled today.',
        evidence: {
          id: 'ev-3',
          storagePath: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
          fileType: 'image/jpeg',
          uploadedBy: 'Chef Kavita Menon',
          geoLat: 13.036,
          geoLng: 80.247,
          capturedAt: `${TODAY_STR}T08:14:00.000Z`,
        },
      },
      {
        id: 't-4',
        title: 'Calibrate Meat Thermometers & Probe Sanitization',
        description: 'Ice bath calibration test to ensure 0.0°C ± 0.5°C accuracy.',
        priority: 'Medium',
        requiresPhoto: false,
        status: 'Completed',
        completedAt: `${TODAY_STR}T08:25:00.000Z`,
        completedBy: 'Chef Kavita Menon',
      },
      {
        id: 't-5',
        title: 'Verify Knife Station Sanitization & Safety Guards',
        description: 'Inspect chef knives in UV sanitizer cabinet and verify safety gloves.',
        priority: 'Medium',
        requiresPhoto: false,
        status: 'Completed',
        completedAt: `${TODAY_STR}T08:35:00.000Z`,
        completedBy: 'Chef Kavita Menon',
      },
      {
        id: 't-6',
        title: 'Morning Mise en Place & Fresh Herbs Stock Verification',
        description: 'Inspect chopped aromatics, microgreens, and sauces prepared for lunch shift.',
        priority: 'High',
        requiresPhoto: true,
        status: 'Completed',
        completedAt: `${TODAY_STR}T08:45:00.000Z`,
        completedBy: 'Chef Kavita Menon',
        evidence: {
          id: 'ev-4',
          storagePath: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
          fileType: 'image/jpeg',
          uploadedBy: 'Chef Kavita Menon',
          geoLat: 13.036,
          geoLng: 80.247,
          capturedAt: `${TODAY_STR}T08:44:00.000Z`,
        },
      },
    ],
  },
  {
    id: 'exec-palavakkam-escalated',
    templateId: 'tmpl-haccp-hygiene',
    templateTitle: 'Food Safety & HACCP Hygiene Protocol',
    category: 'Hygiene',
    outlet: 'Palavakkam',
    assignedUserId: 'usr-chef-1',
    assignedUserName: 'Chef Rajesh Sharma',
    assignedRole: 'Chef',
    shiftDate: TODAY_STR,
    status: 'Escalated',
    assignedBy: 'Vikram Seth (Manager)',
    assignedAt: `${TODAY_STR}T06:00:00.000Z`,
    reviewedBy: 'Vikram Seth (Manager)',
    reviewedAt: `${TODAY_STR}T10:00:00.000Z`,
    reviewRemarks: 'Overdue task: Sanitizer bucket PPM test not completed before opening inspection.',
    tasks: [
      {
        id: 'th-1',
        title: 'Chef Uniform, Hair Net & Handwash Sink Paper Towel Check',
        priority: 'High',
        requiresPhoto: false,
        status: 'Completed',
        completedAt: `${TODAY_STR}T06:30:00.000Z`,
      },
      {
        id: 'th-2',
        title: 'Raw Seafood & Poultry Storage Separation Check',
        priority: 'Critical',
        requiresPhoto: true,
        status: 'Completed',
        completedAt: `${TODAY_STR}T07:00:00.000Z`,
      },
      {
        id: 'th-3',
        title: 'Line Sanitizer Bucket Chlorine/Quat PPM Test',
        priority: 'High',
        requiresPhoto: true,
        status: 'Escalated',
        remarks: 'Test strips ran out. Fresh box requisitioned.',
      },
      {
        id: 'th-4',
        title: 'Dishwasher Final Rinse Temp Log (> 82°C)',
        priority: 'High',
        requiresPhoto: true,
        status: 'Pending',
      },
      {
        id: 'th-5',
        title: 'Dry Store Pest Barrier & Airtight Container Seal Inspection',
        priority: 'Medium',
        requiresPhoto: false,
        status: 'Pending',
      },
    ],
  },
  {
    id: 'exec-egmore-bar',
    templateId: 'tmpl-bar-beverage',
    templateTitle: 'Bar & Beverage Station Opening',
    category: 'Bar',
    outlet: 'Egmore',
    assignedRole: 'Chef',
    shiftDate: TODAY_STR,
    status: 'Pending',
    assignedBy: 'Karthik Admin',
    assignedAt: `${TODAY_STR}T08:00:00.000Z`,
    tasks: [
      {
        id: 'tb-1',
        title: 'Ice Machine Cleanliness & Scoop Sanitizer Holder Check',
        priority: 'High',
        requiresPhoto: true,
        status: 'Pending',
      },
      {
        id: 'tb-2',
        title: 'Cold Brew Nitrogen Tap Pressure & Flush Verification',
        priority: 'Medium',
        requiresPhoto: false,
        status: 'Pending',
      },
      {
        id: 'tb-3',
        title: 'Fresh Citrus Garnishes & Infused Syrups Mise en Place',
        priority: 'Medium',
        requiresPhoto: true,
        status: 'Pending',
      },
      {
        id: 'tb-4',
        title: 'Glassware Steam Polish & Chip-Free Inspection',
        priority: 'High',
        requiresPhoto: false,
        status: 'Pending',
      },
    ],
  },
];

// ── Storage Accessors ───────────────────────────────────────────────────────

export const getStoredTemplates = (): ChecklistTemplate[] => {
  try {
    const saved = localStorage.getItem(TEMPLATES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse SOP templates', e);
  }
  return [...INITIAL_TEMPLATES];
};

export const setStoredTemplates = (templates: ChecklistTemplate[]): void => {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    window.dispatchEvent(new CustomEvent(SOP_UPDATE_EVENT));
  } catch (e) {
    console.error('Failed to save SOP templates', e);
  }
};

export const getStoredExecutions = (): ChecklistExecution[] => {
  try {
    const saved = localStorage.getItem(EXECUTIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse SOP executions', e);
  }
  return [...INITIAL_EXECUTIONS];
};

export const setStoredExecutions = (executions: ChecklistExecution[]): void => {
  try {
    localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(executions));
    window.dispatchEvent(new CustomEvent(SOP_UPDATE_EVENT));
  } catch (e) {
    console.error('Failed to save SOP executions', e);
  }
};

// ── Template CRUD Methods (Admin & SuperAdmin only) ──────────────────────────

export const createChecklistTemplate = (
  actor: UserProfile,
  data: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
): ChecklistTemplate => {
  if (!canCreateChecklistTemplate(actor)) {
    throw new Error('Unauthorized: Only SuperAdmin and Admin can create checklist templates.');
  }

  const templates = getStoredTemplates();
  const newTemplate: ChecklistTemplate = {
    ...data,
    id: 'tmpl-' + Date.now(),
    createdBy: actor.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setStoredTemplates([newTemplate, ...templates]);
  return newTemplate;
};

export const updateChecklistTemplate = (
  actor: UserProfile,
  id: string,
  updates: Partial<Omit<ChecklistTemplate, 'id' | 'createdAt' | 'createdBy'>>
): ChecklistTemplate => {
  if (!canEditOrDeleteTemplate(actor)) {
    throw new Error('Unauthorized: Only SuperAdmin and Admin can edit checklist templates.');
  }

  const templates = getStoredTemplates();
  const idx = templates.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Template not found');

  const updated: ChecklistTemplate = {
    ...templates[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  templates[idx] = updated;
  setStoredTemplates([...templates]);
  return updated;
};

export const deleteChecklistTemplate = (actor: UserProfile, id: string): boolean => {
  if (!canEditOrDeleteTemplate(actor)) {
    throw new Error('Unauthorized: Only SuperAdmin and Admin can delete checklist templates.');
  }

  const templates = getStoredTemplates();
  const filtered = templates.filter(t => t.id !== id);
  if (filtered.length === templates.length) return false;

  setStoredTemplates(filtered);
  return true;
};

// ── Shift Assignment Methods (SuperAdmin, Admin, Manager) ───────────────────

export const assignChecklistToShift = (
  actor: UserProfile,
  payload: {
    templateId: string;
    outlet: string;
    assignedUserId?: string;
    assignedUserName?: string;
    assignedRole: any;
    shiftDate?: string;
  }
): ChecklistExecution => {
  if (!canAssignChecklistToStaff(actor)) {
    throw new Error('Unauthorized: Only SuperAdmin, Admin, or Manager can assign shift checklists.');
  }

  const templates = getStoredTemplates();
  const template = templates.find(t => t.id === payload.templateId);
  if (!template) throw new Error('Selected template does not exist.');

  const executions = getStoredExecutions();

  const executionTasks: ExecutionTaskItem[] = template.tasks.map(t => ({
    id: 'task-' + Math.random().toString(36).slice(2, 9),
    templateTaskId: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    requiresPhoto: t.requiresPhoto,
    status: 'Pending',
  }));

  const newExecution: ChecklistExecution = {
    id: 'exec-' + Date.now(),
    templateId: template.id,
    templateTitle: template.title,
    category: template.category,
    outlet: payload.outlet,
    assignedUserId: payload.assignedUserId,
    assignedUserName: payload.assignedUserName,
    assignedRole: payload.assignedRole,
    shiftDate: payload.shiftDate || TODAY_STR,
    status: 'Pending',
    tasks: executionTasks,
    assignedBy: actor.name,
    assignedAt: new Date().toISOString(),
  };

  setStoredExecutions([newExecution, ...executions]);
  return newExecution;
};

// ── Task Execution & Evidence Methods (Chef / Assigned Staff / Manager) ─────

export const updateTaskProgress = (
  actor: UserProfile,
  executionId: string,
  taskId: string,
  updates: {
    status?: ChecklistTaskStatus;
    remarks?: string;
    evidence?: ExecutionTaskEvidence;
  }
): ChecklistExecution => {
  const executions = getStoredExecutions();
  const execIdx = executions.findIndex(e => e.id === executionId);
  if (execIdx === -1) throw new Error('Checklist execution not found.');

  const execution = executions[execIdx];

  if (!canFillOrCompleteChecklist(actor, execution)) {
    throw new Error('Unauthorized: You are not permitted to complete tasks on this checklist.');
  }

  const taskIdx = execution.tasks.findIndex(t => t.id === taskId);
  if (taskIdx === -1) throw new Error('Task not found in checklist execution.');

  const currentTask = execution.tasks[taskIdx];
  const newStatus = updates.status || currentTask.status;

  execution.tasks[taskIdx] = {
    ...currentTask,
    status: newStatus,
    remarks: updates.remarks !== undefined ? updates.remarks : currentTask.remarks,
    evidence: updates.evidence || currentTask.evidence,
    completedAt: newStatus === 'Completed' ? new Date().toISOString() : currentTask.completedAt,
    completedBy: newStatus === 'Completed' ? actor.name : currentTask.completedBy,
  };

  // Recalculate overall checklist execution status
  const allTasks = execution.tasks;
  const isAllCompleted = allTasks.every(t => t.status === 'Completed');
  const hasEscalated = allTasks.some(t => t.status === 'Escalated');
  const hasInProgress = allTasks.some(t => t.status === 'In Progress');

  if (isAllCompleted) {
    execution.status = 'Completed';
    execution.completedAt = new Date().toISOString();
  } else if (hasEscalated) {
    execution.status = 'Escalated';
  } else if (hasInProgress || allTasks.some(t => t.status === 'Completed')) {
    execution.status = 'In Progress';
  } else {
    execution.status = 'Pending';
  }

  executions[execIdx] = { ...execution };
  setStoredExecutions([...executions]);
  return executions[execIdx];
};

// ── Manager Review & Escalation Methods ─────────────────────────────────────

export const reviewChecklistExecution = (
  actor: UserProfile,
  executionId: string,
  review: {
    approved: boolean;
    remarks?: string;
  }
): ChecklistExecution => {
  if (!['SuperAdmin', 'Admin', 'Manager'].includes(actor.role || '')) {
    throw new Error('Unauthorized: Only Managers and Admins can review checklists.');
  }

  const executions = getStoredExecutions();
  const execIdx = executions.findIndex(e => e.id === executionId);
  if (execIdx === -1) throw new Error('Checklist execution not found.');

  const execution = executions[execIdx];
  execution.reviewedBy = actor.name;
  execution.reviewedAt = new Date().toISOString();
  execution.reviewRemarks = review.remarks;

  if (review.approved) {
    execution.status = 'Completed';
    if (!execution.completedAt) execution.completedAt = new Date().toISOString();
  } else {
    execution.status = 'Escalated';
  }

  executions[execIdx] = { ...execution };
  setStoredExecutions([...executions]);
  return executions[execIdx];
};

// ── React Hook: useSOPAndChecklists ─────────────────────────────────────────

export const useSOPAndChecklists = (actor: UserProfile) => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(() => getStoredTemplates());
  const [executions, setExecutions] = useState<ChecklistExecution[]>(() => getStoredExecutions());

  const reload = () => {
    setTemplates(getStoredTemplates());
    setExecutions(getStoredExecutions());
  };

  useEffect(() => {
    const handler = () => reload();
    window.addEventListener(SOP_UPDATE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(SOP_UPDATE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // RBAC filtered executions
  const filteredExecutions = executions.filter(exec => {
    if (canViewAllOutletChecklists(actor)) return true;
    if (canViewOwnOutletChecklists(actor)) {
      // If Manager, filter by outlet if actor has outlet assigned or allow own outlet
      if (actor.role === 'Chef') {
        // Chef sees assigned tasks or tasks in their outlet
        return exec.assignedUserId === actor.id || exec.assignedRole === 'Chef';
      }
      return true;
    }
    return false;
  });

  return {
    templates,
    executions: filteredExecutions,
    allExecutions: executions,
    createTemplate: (data: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) =>
      createChecklistTemplate(actor, data),
    updateTemplate: (id: string, updates: Partial<ChecklistTemplate>) =>
      updateChecklistTemplate(actor, id, updates),
    deleteTemplate: (id: string) => deleteChecklistTemplate(actor, id),
    assignShift: (payload: {
      templateId: string;
      outlet: string;
      assignedUserId?: string;
      assignedUserName?: string;
      assignedRole: any;
      shiftDate?: string;
    }) => assignChecklistToShift(actor, payload),
    updateTask: (
      executionId: string,
      taskId: string,
      updates: { status?: ChecklistTaskStatus; remarks?: string; evidence?: ExecutionTaskEvidence }
    ) => updateTaskProgress(actor, executionId, taskId, updates),
    reviewExecution: (executionId: string, review: { approved: boolean; remarks?: string }) =>
      reviewChecklistExecution(actor, executionId, review),
    reload,
    refresh: reload,
  };
};
