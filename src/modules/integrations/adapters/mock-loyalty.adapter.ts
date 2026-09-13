import type { LoyaltyAdapter, LoyaltyAccount, LoyaltyTransaction } from '../integration.types';
import type { IntegrationMode } from '../../../types/database.types';

export class MockLoyaltyAdapter implements LoyaltyAdapter {
  readonly mode: IntegrationMode = 'mocked';

  async getCustomerAccount(customerId: string): Promise<LoyaltyAccount> {
    return {
      customerId,
      tier: 'gold',
      pointsBalance: 450,
      lifetimePoints: 1200,
    };
  }

  async earnPoints(customerId: string, points: number, description: string): Promise<LoyaltyTransaction> {
    return {
      id: `tx-${Date.now()}`,
      customerId,
      points,
      type: 'earned',
      description,
      createdAt: new Date().toISOString(),
    };
  }

  async redeemPoints(customerId: string, points: number, description: string): Promise<LoyaltyTransaction> {
    return {
      id: `tx-${Date.now()}`,
      customerId,
      points,
      type: 'redeemed',
      description,
      createdAt: new Date().toISOString(),
    };
  }
}
