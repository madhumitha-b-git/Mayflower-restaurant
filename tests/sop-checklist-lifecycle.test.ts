import { describe, it, expect, beforeEach } from 'vitest';
import {
  canAccessSOPModule,
  canCreateChecklistTemplate,
  canEditOrDeleteTemplate,
  canAssignChecklistToStaff,
  canViewAllOutletChecklists,
  canViewOwnOutletChecklists,
  canFillOrCompleteChecklist,
} from '../src/rbac/policies';
import {
  getStoredTemplates,
  setStoredTemplates,
  getStoredExecutions,
  setStoredExecutions,
  createChecklistTemplate,
  updateChecklistTemplate,
  deleteChecklistTemplate,
  assignChecklistToShift,
  updateTaskProgress,
  reviewChecklistExecution,
  INITIAL_TEMPLATES,
  INITIAL_EXECUTIONS,
} from '../src/data/sopStorage';
import { UserProfile } from '../src/types';

describe('SOP and Checklist Lifecycle System', () => {
  // Test Users for each role
  const createMockUser = (overrides: Partial<UserProfile> & { id: string; name: string; email: string; role: UserProfile['role'] }): UserProfile => ({
    phone: '+91 98765 43210',
    rewardPoints: 100,
    tier: 'Green',
    totalVisits: 5,
    joinedDate: '2026-01-01',
    transactions: [],
    ...overrides,
  });

  const superAdminUser: UserProfile = createMockUser({
    id: 'user-sa',
    name: 'Master Overseer',
    email: 'admin@mayflower.com',
    role: 'SuperAdmin',
  });

  const adminUser: UserProfile = createMockUser({
    id: 'user-admin',
    name: 'Executive Director',
    email: 'director@mayflower.com',
    role: 'Admin',
  });

  const managerAnnaNagar: UserProfile = createMockUser({
    id: 'user-mgr-an',
    name: 'Manager Priya',
    email: 'priya.annanagar@mayflower.com',
    role: 'Manager',
    outlet: 'Anna Nagar Flagship Solarium',
  });

  const chefRamesh: UserProfile = createMockUser({
    id: 'user-chef-ramesh',
    name: 'Chef Ramesh',
    email: 'ramesh.chef@mayflower.com',
    role: 'Chef',
    outlet: 'Anna Nagar Flagship Solarium',
  });

  const ownerUser: UserProfile = createMockUser({
    id: 'user-owner',
    name: 'Sovereign Patron',
    email: 'owner@mayflower.com',
    role: 'Owner',
  });

  const hrUser: UserProfile = createMockUser({
    id: 'user-hr',
    name: 'HR Lead',
    email: 'hr@mayflower.com',
    role: 'HR',
  });

  const accountantUser: UserProfile = createMockUser({
    id: 'user-acc',
    name: 'Financial Auditor',
    email: 'audit@mayflower.com',
    role: 'Accountant',
  });

  const customerUser: UserProfile = createMockUser({
    id: 'user-cust',
    name: 'Dining Guest',
    email: 'guest@gmail.com',
    role: 'Customer',
  });

  beforeEach(() => {
    // Reset to pristine initial seed data before each test
    setStoredTemplates([...INITIAL_TEMPLATES]);
    setStoredExecutions([...INITIAL_EXECUTIONS]);
  });

  describe('1. RBAC Matrix Verification', () => {
    it('SuperAdmin & Admin have full CRUD and assignment rights across all outlets', () => {
      [superAdminUser, adminUser].forEach(user => {
        expect(canAccessSOPModule(user)).toBe(true);
        expect(canCreateChecklistTemplate(user)).toBe(true);
        expect(canEditOrDeleteTemplate(user)).toBe(true);
        expect(canAssignChecklistToStaff(user)).toBe(true);
        expect(canViewAllOutletChecklists(user)).toBe(true);
        expect(canViewOwnOutletChecklists(user)).toBe(true);
        expect(canFillOrCompleteChecklist(user)).toBe(true);
      });
    });

    it('Manager can assign to own shift, review/complete, view own outlet, but CANNOT create templates or view all outlets', () => {
      expect(canAccessSOPModule(managerAnnaNagar)).toBe(true);
      expect(canCreateChecklistTemplate(managerAnnaNagar)).toBe(false);
      expect(canEditOrDeleteTemplate(managerAnnaNagar)).toBe(false);
      expect(canAssignChecklistToStaff(managerAnnaNagar)).toBe(true);
      expect(canViewAllOutletChecklists(managerAnnaNagar)).toBe(false);
      expect(canViewOwnOutletChecklists(managerAnnaNagar)).toBe(true);
      expect(canFillOrCompleteChecklist(managerAnnaNagar)).toBe(true);
    });

    it('Chef can execute/complete assigned tasks, view own tasks, but CANNOT create, edit or assign templates', () => {
      expect(canAccessSOPModule(chefRamesh)).toBe(true);
      expect(canCreateChecklistTemplate(chefRamesh)).toBe(false);
      expect(canEditOrDeleteTemplate(chefRamesh)).toBe(false);
      expect(canAssignChecklistToStaff(chefRamesh)).toBe(false);
      expect(canViewAllOutletChecklists(chefRamesh)).toBe(false);
      expect(canViewOwnOutletChecklists(chefRamesh)).toBe(true);
      expect(canFillOrCompleteChecklist(chefRamesh)).toBe(true);
    });

    it('Owner has view-only rights across all outlets and cannot create or assign', () => {
      expect(canAccessSOPModule(ownerUser)).toBe(true);
      expect(canCreateChecklistTemplate(ownerUser)).toBe(false);
      expect(canEditOrDeleteTemplate(ownerUser)).toBe(false);
      expect(canAssignChecklistToStaff(ownerUser)).toBe(false);
      expect(canViewAllOutletChecklists(ownerUser)).toBe(true);
      expect(canViewOwnOutletChecklists(ownerUser)).toBe(true);
      expect(canFillOrCompleteChecklist(ownerUser)).toBe(false);
    });

    it('HR, Accountant, and Customer have NO access to SOP modules', () => {
      [hrUser, accountantUser, customerUser].forEach(user => {
        expect(canAccessSOPModule(user)).toBe(false);
        expect(canCreateChecklistTemplate(user)).toBe(false);
        expect(canEditOrDeleteTemplate(user)).toBe(false);
        expect(canAssignChecklistToStaff(user)).toBe(false);
        expect(canViewAllOutletChecklists(user)).toBe(false);
        expect(canViewOwnOutletChecklists(user)).toBe(false);
        expect(canFillOrCompleteChecklist(user)).toBe(false);
      });
    });
  });

  describe('2. End-to-End SOP Workflow Lifecycle', () => {
    it('Step 1: Admin creates checklist template ("Kitchen Opening Checklist" with 6 tasks, category: Opening)', () => {
      const createdTemplate = createChecklistTemplate(adminUser, {
        title: 'Kitchen Opening Checklist — Deluxe Protocol',
        category: 'Opening',
        targetRole: 'Chef',
        description: 'Standardized 6-step morning opening checklist for culinary brigade',
        estimatedDurationMins: 30,
        tasks: [
          { id: 't1', title: 'Unlock walk-in chiller & record internal temperature', priority: 'Critical', requiresPhoto: true },
          { id: 't2', title: 'Calibrate digital food probe thermometers in ice-water bath', priority: 'High', requiresPhoto: false },
          { id: 't3', title: 'Check water filtration system & boiler pressure levels', priority: 'Medium', requiresPhoto: false },
          { id: 't4', title: 'Inspect raw seafood & Wagyu beef storage temperatures (< 2°C)', priority: 'Critical', requiresPhoto: true },
          { id: 't5', title: 'Sanitize prep tables with 200 PPM food-safe chlorine solution', priority: 'High', requiresPhoto: true },
          { id: 't6', title: 'Turn on exhaust canopy hoods and make-up air unit', priority: 'Medium', requiresPhoto: false },
        ],
      });

      expect(createdTemplate.id).toBeDefined();
      expect(createdTemplate.title).toBe('Kitchen Opening Checklist — Deluxe Protocol');
      expect(createdTemplate.category).toBe('Opening');
      expect(createdTemplate.tasks).toHaveLength(6);

      const templates = getStoredTemplates();
      expect(templates.find(t => t.id === createdTemplate.id)).toBeDefined();
    });

    it('Step 2: Manager assigns template to today\'s shift ("Assign to Chef Ramesh, Anna Nagar, today")', () => {
      const allTemplates = getStoredTemplates();
      const openingTemplate = allTemplates.find(t => t.category === 'Opening') || allTemplates[0];

      const execution = assignChecklistToShift(managerAnnaNagar, {
        templateId: openingTemplate.id,
        outlet: managerAnnaNagar.outlet || 'Anna Nagar Flagship Solarium',
        assignedUserName: 'Chef Ramesh',
        assignedUserId: chefRamesh.id,
        assignedRole: 'Chef',
        shiftDate: '2026-09-22',
      });

      expect(execution.id).toBeDefined();
      expect(execution.assignedUserName).toBe('Chef Ramesh');
      expect(execution.outlet).toBe('Anna Nagar Flagship Solarium');
      expect(execution.status).toBe('Pending');
      expect(execution.tasks).toHaveLength(openingTemplate.tasks.length);
    });

    it('Step 3: Chef executes the work (checks off tasks, uploads photo evidence + GPS, marks In Progress -> Completed)', () => {
      const allTemplates = getStoredTemplates();
      const tpl = allTemplates[0];

      // Manager assigns checklist to Chef Ramesh
      const execution = assignChecklistToShift(managerAnnaNagar, {
        templateId: tpl.id,
        outlet: 'Anna Nagar Flagship Solarium',
        assignedUserName: 'Chef Ramesh',
        assignedUserId: chefRamesh.id,
        assignedRole: 'Chef',
        shiftDate: '2026-09-22',
      });

      const firstTask = execution.tasks[0];

      // Chef checks task 1 and attaches photo evidence with GPS
      const updated1 = updateTaskProgress(
        chefRamesh,
        execution.id,
        firstTask.id,
        {
          status: 'Completed',
          remarks: 'Temp logged at 3.1°C — probe sanitized and calibrated',
          evidence: {
            id: 'ev-1',
            storagePath: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
            fileType: 'image/jpeg',
            uploadedBy: chefRamesh.name,
            capturedAt: new Date().toISOString(),
            geoLat: 13.0827,
            geoLng: 80.2707,
          },
        }
      );

      expect(updated1).toBeDefined();
      expect(updated1.status).toBe('In Progress');
      const completedTask1 = updated1.tasks.find(t => t.id === firstTask.id);
      expect(completedTask1?.status).toBe('Completed');
      expect(completedTask1?.evidence?.geoLat).toBe(13.0827);
      expect(completedTask1?.remarks).toContain('3.1°C');

      // Chef completes all remaining tasks
      let currentExec = updated1;
      for (let i = 1; i < currentExec.tasks.length; i++) {
        currentExec = updateTaskProgress(
          chefRamesh,
          execution.id,
          currentExec.tasks[i].id,
          { status: 'Completed', remarks: 'Completed' }
        );
      }

      expect(currentExec.status).toBe('Completed');
    });

    it('Step 4: Manager reviews it (sees Chef marked it Completed, reviews photo evidence, or escalates if overdue/incomplete)', () => {
      const allTemplates = getStoredTemplates();
      const tpl = allTemplates[0];

      // Manager assigns checklist to Chef Ramesh
      const execution = assignChecklistToShift(managerAnnaNagar, {
        templateId: tpl.id,
        outlet: 'Anna Nagar Flagship Solarium',
        assignedUserName: 'Chef Ramesh',
        assignedUserId: chefRamesh.id,
        assignedRole: 'Chef',
        shiftDate: '2026-09-22',
      });

      // Chef completes all tasks
      for (const t of execution.tasks) {
        updateTaskProgress(chefRamesh, execution.id, t.id, {
          status: 'Completed',
          remarks: 'Task finished and verified',
        });
      }

      // Manager reviews and signs off
      const approved = reviewChecklistExecution(
        managerAnnaNagar,
        execution.id,
        {
          approved: true,
          remarks: 'HACCP verification confirmed by Manager Priya',
        }
      );

      expect(approved.status).toBe('Completed');
      expect(approved.reviewedBy).toBe('Manager Priya');
      expect(approved.reviewRemarks).toContain('HACCP verification confirmed');

      // Test Escalation for an overdue/incomplete task
      const incompleteExecution = assignChecklistToShift(managerAnnaNagar, {
        templateId: tpl.id,
        outlet: 'Anna Nagar Flagship Solarium',
        assignedUserName: 'Chef Ramesh',
        assignedUserId: chefRamesh.id,
        assignedRole: 'Chef',
        shiftDate: '2026-09-22',
      });

      const escalated = reviewChecklistExecution(
        managerAnnaNagar,
        incompleteExecution.id,
        {
          approved: false,
          remarks: 'Missing sanitizer photo evidence past due time',
        }
      );

      expect(escalated.status).toBe('Escalated');
      expect(escalated.reviewRemarks).toContain('Missing sanitizer photo evidence');
    });

    it('Step 5: Super Admin monitors across all 12 outlets (sees X checklists overdue today across outlets without digging into each one)', () => {
      // Check stored executions across outlets
      const executions = getStoredExecutions();
      expect(executions.length).toBeGreaterThan(0);

      // Verify overdue/escalated items are immediately visible
      const overdueOrEscalated = executions.filter(
        ex => ex.status === 'Overdue' || ex.status === 'Escalated'
      );
      expect(overdueOrEscalated.length).toBeGreaterThan(0);

      // Verify cross-outlet representation
      const outletsWithRecords = new Set(executions.map(e => e.outlet));
      expect(outletsWithRecords.size).toBeGreaterThanOrEqual(3);
    });

    it('Step 6: Template editing and deletion for Admin', () => {
      const newTpl = createChecklistTemplate(adminUser, {
        title: 'Temporary Test Template',
        category: 'Safety',
        targetRole: 'Chef',
        description: 'Testing edit and delete',
        estimatedDurationMins: 15,
        tasks: [{ id: 'tt1', title: 'Test Checkpoint', priority: 'Low' }],
      });

      // Edit template
      const updated = updateChecklistTemplate(adminUser, newTpl.id, {
        title: 'Updated Temporary Test Template',
        estimatedDurationMins: 20,
      });
      expect(updated.title).toBe('Updated Temporary Test Template');
      expect(updated.estimatedDurationMins).toBe(20);

      // Delete template
      const deleteResult = deleteChecklistTemplate(adminUser, newTpl.id);
      expect(deleteResult).toBe(true);

      const templatesAfter = getStoredTemplates();
      expect(templatesAfter.find(t => t.id === newTpl.id)).toBeUndefined();
    });
  });
});
