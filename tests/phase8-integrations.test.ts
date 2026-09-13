import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { MockPetpoojaAdapter } from '../src/modules/integrations/adapters/mock-petpooja.adapter';
import { MockLoyaltyAdapter } from '../src/modules/integrations/adapters/mock-loyalty.adapter';
import { MockCctvAdapter } from '../src/modules/integrations/adapters/mock-cctv.adapter';
import { IntegrationsService } from '../src/modules/integrations/integrations.service';
import type { PetpoojaAdapter, LoyaltyAdapter, CctvAdapter } from '../src/modules/integrations/integration.types';

describe('Phase 8 — Integration Adapter Layer (Mocked)', () => {
  const checklistPath = path.join(__dirname, '../docs/integration-go-live-checklist.md');

  it('documents integration go-live checklist', () => {
    expect(fs.existsSync(checklistPath)).toBe(true);
    const content = fs.readFileSync(checklistPath, 'utf8');
    expect(content).toContain('Petpooja (POS Integration)');
    expect(content).toContain('Loyalty Provider');
    expect(content).toContain('CCTV Monitoring');
  });

  describe('Mock Petpooja Adapter', () => {
    const adapter: PetpoojaAdapter = new MockPetpoojaAdapter();

    it('returns realistic sales summary for Mayflower Chennai outlet', async () => {
      const summary = await adapter.getDailySalesSummary('11111111-1111-1111-1111-111111111111', '2026-09-13');
      expect(summary.totalSales).toBe(145800.00);
      expect(summary.totalOrders).toBe(124);
      expect(summary.paymentBreakdown.upi).toBe(55800.00);
    });

    it('returns inventory stock levels', async () => {
      const inventory = await adapter.getInventoryStatus('11111111-1111-1111-1111-111111111111');
      expect(inventory.length).toBeGreaterThan(0);
      expect(inventory[0].name).toBe('Truffle Oil');
    });
  });

  describe('Mock Loyalty Adapter', () => {
    const adapter: LoyaltyAdapter = new MockLoyaltyAdapter();

    it('returns customer loyalty account balance', async () => {
      const account = await adapter.getCustomerAccount('cust-123');
      expect(account.tier).toBe('gold');
      expect(account.pointsBalance).toBe(450);
    });

    it('processes points earn and redeem transactions', async () => {
      const earned = await adapter.earnPoints('cust-123', 50, 'Dining at Chennai flagship');
      expect(earned.points).toBe(50);
      expect(earned.type).toBe('earned');

      const redeemed = await adapter.redeemPoints('cust-123', 100, 'Redeemed dessert voucher');
      expect(redeemed.points).toBe(100);
      expect(redeemed.type).toBe('redeemed');
    });
  });

  describe('Mock CCTV Adapter', () => {
    const adapter: CctvAdapter = new MockCctvAdapter();

    it('returns camera feed list for outlet', async () => {
      const feeds = await adapter.getCameraFeeds('11111111-1111-1111-1111-111111111111');
      expect(feeds.length).toBe(3);
      expect(feeds[0].cameraName).toBe('Main Dining Entrance');
    });
  });

  describe('Interface Stability across Mode Switch', () => {
    it('returns consistent adapter contracts regardless of config mode', async () => {
      const petpooja = await IntegrationsService.getPetpoojaAdapter('11111111-1111-1111-1111-111111111111');
      const loyalty = await IntegrationsService.getLoyaltyAdapter('11111111-1111-1111-1111-111111111111');
      const cctv = await IntegrationsService.getCctvAdapter('11111111-1111-1111-1111-111111111111');

      expect(petpooja.getDailySalesSummary).toBeDefined();
      expect(loyalty.getCustomerAccount).toBeDefined();
      expect(cctv.getCameraFeeds).toBeDefined();
    });
  });
});
