import type { IntegrationMode } from '../../types/database.types';

export interface PetpoojaSalesSummary {
  outletId: string;
  date: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  taxAmount: number;
  paymentBreakdown: {
    cash: number;
    card: number;
    upi: number;
  };
}

export interface PetpoojaInventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface PetpoojaOrder {
  id: string;
  orderNumber: string;
  tableCode: string | null;
  itemsCount: number;
  totalAmount: number;
  status: 'completed' | 'cancelled';
  createdAt: string;
}

export interface PetpoojaAdapter {
  mode: IntegrationMode;
  getDailySalesSummary(outletId: string, date: string): Promise<PetpoojaSalesSummary>;
  getInventoryStatus(outletId: string): Promise<PetpoojaInventoryItem[]>;
  getRecentOrders(outletId: string, limit?: number): Promise<PetpoojaOrder[]>;
}

export interface LoyaltyAccount {
  customerId: string;
  tier: 'silver' | 'gold' | 'platinum';
  pointsBalance: number;
  lifetimePoints: number;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  createdAt: string;
}

export interface LoyaltyAdapter {
  mode: IntegrationMode;
  getCustomerAccount(customerId: string): Promise<LoyaltyAccount>;
  earnPoints(customerId: string, points: number, description: string): Promise<LoyaltyTransaction>;
  redeemPoints(customerId: string, points: number, description: string): Promise<LoyaltyTransaction>;
}

export interface CctvFeed {
  id: string;
  cameraName: string;
  floorName: string;
  streamUrl: string;
  status: 'online' | 'offline' | 'maintenance';
}

export interface CctvAdapter {
  mode: IntegrationMode;
  getCameraFeeds(outletId: string): Promise<CctvFeed[]>;
  getFeedStatus(cameraId: string): Promise<'online' | 'offline' | 'maintenance'>;
}
