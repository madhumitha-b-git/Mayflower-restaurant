import type { PetpoojaAdapter, PetpoojaSalesSummary, PetpoojaInventoryItem, PetpoojaOrder } from '../integration.types';
import type { IntegrationMode } from '../../../types/database.types';

export class MockPetpoojaAdapter implements PetpoojaAdapter {
  readonly mode: IntegrationMode = 'mocked';

  async getDailySalesSummary(outletId: string, date: string): Promise<PetpoojaSalesSummary> {
    return {
      outletId,
      date,
      totalSales: 145800.00,
      totalOrders: 124,
      averageOrderValue: 1175.80,
      taxAmount: 7290.00,
      paymentBreakdown: {
        cash: 25000.00,
        card: 65000.00,
        upi: 55800.00,
      },
    };
  }

  async getInventoryStatus(_outletId: string): Promise<PetpoojaInventoryItem[]> {
    return [
      { id: 'inv-1', name: 'Truffle Oil', currentStock: 12, unit: 'liters', reorderLevel: 5, status: 'in_stock' },
      { id: 'inv-2', name: 'Rosemary Stems', currentStock: 3, unit: 'kg', reorderLevel: 5, status: 'low_stock' },
      { id: 'inv-3', name: 'Lamb Ribs', currentStock: 25, unit: 'kg', reorderLevel: 10, status: 'in_stock' },
    ];
  }

  async getRecentOrders(_outletId: string, limit = 5): Promise<PetpoojaOrder[]> {
    const orders: PetpoojaOrder[] = [
      { id: 'ord-101', orderNumber: 'POS-8901', tableCode: 'T01', itemsCount: 4, totalAmount: 1850.00, status: 'completed', createdAt: new Date().toISOString() },
      { id: 'ord-102', orderNumber: 'POS-8902', tableCode: 'T03', itemsCount: 2, totalAmount: 1250.00, status: 'completed', createdAt: new Date().toISOString() },
    ];
    return orders.slice(0, limit);
  }
}
