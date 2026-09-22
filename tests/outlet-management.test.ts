import { describe, it, expect, beforeEach } from 'vitest';
import {
  canCreateOutlet,
  canEditOutlet,
  canPublishOutlet,
  canDeleteOutlet,
  canViewOutlets,
} from '../src/rbac/policies';
import {
  getStoredOutlets,
  setStoredOutlets,
  getPublishedOutlets,
  createOutlet,
  updateOutlet,
  toggleOutletPublish,
  deleteOutlet,
  INITIAL_OUTLET_STORAGE,
} from '../src/data/outletStorage';
import { UserProfile } from '../src/types';

describe('Multi-Outlet Management & Live Synchronization System', () => {
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
    id: 'user-superadmin',
    name: 'Super Administrator',
    email: 'superadmin@mayflower.in',
    role: 'SuperAdmin',
  });

  const adminUser: UserProfile = createMockUser({
    id: 'user-admin',
    name: 'Executive Director',
    email: 'director@mayflower.in',
    role: 'Admin',
  });

  const managerUser: UserProfile = createMockUser({
    id: 'user-mgr',
    name: 'Branch Manager',
    email: 'manager.annanagar@mayflower.in',
    role: 'Manager',
    outlet: 'Anna Nagar',
  });

  const customerUser: UserProfile = createMockUser({
    id: 'user-cust',
    name: 'Patron Guest',
    email: 'guest@gmail.com',
    role: 'Customer',
  });

  beforeEach(() => {
    // Reset to pristine initial 4 flagship outlets
    setStoredOutlets([...INITIAL_OUTLET_STORAGE]);
  });

  describe('1. Role-Based Access Control (RBAC) Matrix', () => {
    it('SuperAdmin has full permissions: Create, Edit, Publish, Delete, View', () => {
      expect(canCreateOutlet(superAdminUser)).toBe(true);
      expect(canEditOutlet(superAdminUser)).toBe(true);
      expect(canPublishOutlet(superAdminUser)).toBe(true);
      expect(canDeleteOutlet(superAdminUser)).toBe(true);
      expect(canViewOutlets(superAdminUser)).toBe(true);
    });

    it('Admin and Manager have View-only access (Create, Edit, Publish, Delete restricted)', () => {
      [adminUser, managerUser].forEach((user) => {
        expect(canViewOutlets(user)).toBe(true);
        expect(canCreateOutlet(user)).toBe(false);
        expect(canEditOutlet(user)).toBe(false);
        expect(canPublishOutlet(user)).toBe(false);
        expect(canDeleteOutlet(user)).toBe(false);
      });
    });

    it('Customer cannot create, edit, or manage outlets', () => {
      expect(canCreateOutlet(customerUser)).toBe(false);
      expect(canEditOutlet(customerUser)).toBe(false);
      expect(canPublishOutlet(customerUser)).toBe(false);
      expect(canDeleteOutlet(customerUser)).toBe(false);
    });
  });

  describe('2. Multi-Outlet Creation & Draft Staging', () => {
    it('SuperAdmin can create a new outlet in Draft mode', () => {
      const res = createOutlet(superAdminUser, {
        name: 'T. Nagar Luxury Pavilion',
        tagline: 'Art Deco Salon & Rooftop',
        address: '45 Usman Road, T. Nagar, Chennai',
        hours: '11:00 AM – 11:00 PM',
        phone: '80981 89000',
        description: 'Newest Mayflower sanctuary situated in the heart of T. Nagar shopping district.',
        status: 'Draft',
        tablesCount: 22,
        coversCount: 88,
      });

      expect(res.success).toBe(true);
      expect(res.outlet).toBeDefined();
      expect(res.outlet?.id).toBe('t-nagar-luxury-pavilion');
      expect(res.outlet?.status).toBe('Draft');

      // Verify it exists in all stored outlets
      const allOutlets = getStoredOutlets();
      expect(allOutlets.some((o) => o.id === 't-nagar-luxury-pavilion')).toBe(true);

      // Verify it is NOT visible on public website (getPublishedOutlets)
      const published = getPublishedOutlets();
      expect(published.some((o) => o.id === 't-nagar-luxury-pavilion')).toBe(false);
    });

    it('Admin and Manager cannot create outlets', () => {
      const resAdmin = createOutlet(adminUser, {
        name: 'Unauthorized Admin Branch',
        address: 'Nowhere',
        hours: '12:00 PM',
        phone: '123',
        description: '',
      });
      expect(resAdmin.success).toBe(false);
      expect(resAdmin.error).toContain('Unauthorized');

      const resManager = createOutlet(managerUser, {
        name: 'Unauthorized Manager Branch',
        address: 'Nowhere',
        hours: '12:00 PM',
        phone: '123',
        description: '',
      });
      expect(resManager.success).toBe(false);
    });
  });

  describe('3. Dynamic Live Publishing & Public Website Synchronization', () => {
    it('Publishing an outlet immediately makes it visible in getPublishedOutlets without redeploy', () => {
      // Step 1: Create in Draft
      createOutlet(superAdminUser, {
        name: 'Velachery Solarium',
        address: '100 Feet Bypass Road, Velachery, Chennai',
        hours: '11:00 AM – 11:00 PM',
        phone: '80981 89000',
        description: 'Glasshouse dining sanctuary with curated botanicals.',
        status: 'Draft',
      });

      expect(getPublishedOutlets().some((o) => o.id === 'velachery-solarium')).toBe(false);

      // Step 2: Super Admin toggles publish to Published
      const toggleRes = toggleOutletPublish(superAdminUser, 'velachery-solarium', true);
      expect(toggleRes.success).toBe(true);
      expect(toggleRes.outlet?.status).toBe('Published');

      // Step 3: Verify it immediately appears in published outlets (which feeds public website & reservation selector)
      const publishedNow = getPublishedOutlets();
      expect(publishedNow.some((o) => o.id === 'velachery-solarium')).toBe(true);

      // Step 4: Unpublishing immediately hides it
      const unpublishRes = toggleOutletPublish(superAdminUser, 'velachery-solarium', false);
      expect(unpublishRes.success).toBe(true);
      expect(getPublishedOutlets().some((o) => o.id === 'velachery-solarium')).toBe(false);
    });
  });

  describe('4. Outlet Configuration & Editing', () => {
    it('SuperAdmin can update outlet tables count, covers, and operating hours', () => {
      const updateRes = updateOutlet(superAdminUser, 'poes-garden', {
        tablesCount: 30,
        coversCount: 120,
        hours: '10:00 AM – 11:30 PM (Daily)',
      });

      expect(updateRes.success).toBe(true);
      expect(updateRes.outlet?.tablesCount).toBe(30);
      expect(updateRes.outlet?.coversCount).toBe(120);
      expect(updateRes.outlet?.hours).toBe('10:00 AM – 11:30 PM (Daily)');

      const stored = getStoredOutlets().find((o) => o.id === 'poes-garden');
      expect(stored?.tablesCount).toBe(30);
    });

    it('SuperAdmin can delete an outlet and it is removed from stored outlets', () => {
      createOutlet(superAdminUser, {
        name: 'Temporary Pop-up Branch',
        address: 'Besant Nagar Beach',
        hours: '4:00 PM – 10:00 PM',
        phone: '80981 89000',
        description: 'Temporary beach pop-up.',
      });

      expect(getStoredOutlets().some((o) => o.id === 'temporary-pop-up-branch')).toBe(true);

      const deleteRes = deleteOutlet(superAdminUser, 'temporary-pop-up-branch');
      expect(deleteRes.success).toBe(true);
      expect(getStoredOutlets().some((o) => o.id === 'temporary-pop-up-branch')).toBe(false);
    });
  });
});