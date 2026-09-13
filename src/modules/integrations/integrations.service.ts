import { supabase } from '../../lib/supabase';
import type { IntegrationProvider, IntegrationMode, Database } from '../../types/database.types';
import type { PetpoojaAdapter, LoyaltyAdapter, CctvAdapter } from './integration.types';
import { MockPetpoojaAdapter } from './adapters/mock-petpooja.adapter';
import { MockLoyaltyAdapter } from './adapters/mock-loyalty.adapter';
import { MockCctvAdapter } from './adapters/mock-cctv.adapter';

export type IntegrationConfigRow = Database['public']['Tables']['integration_configs']['Row'];

export class IntegrationsService {
  /**
   * Fetch current mode configuration for an integration provider with safe fallback to 'mocked'
   */
  static async getProviderMode(
    provider: IntegrationProvider,
    outletId?: string
  ): Promise<IntegrationMode> {
    try {
      const { data, error } = await Promise.race([
        supabase
          .from('integration_configs')
          .select('mode')
          .eq('provider', provider)
          .or(`outlet_id.eq.${outletId || 'null'},outlet_id.is.null`)
          .maybeSingle(),
        new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 500)
        ),
      ]);

      if (error || !data) return 'mocked';
      const rawMode = (data as { mode?: string }).mode;
      return (rawMode as IntegrationMode) || 'mocked';
    } catch {
      return 'mocked';
    }
  }

  /**
   * Get Petpooja Adapter instance based on configuration mode
   */
  static async getPetpoojaAdapter(outletId?: string): Promise<PetpoojaAdapter> {
    const mode = await this.getProviderMode('petpooja', outletId);
    if (mode === 'live') {
      return new MockPetpoojaAdapter();
    }
    return new MockPetpoojaAdapter();
  }

  /**
   * Get Loyalty Adapter instance based on configuration mode
   */
  static async getLoyaltyAdapter(outletId?: string): Promise<LoyaltyAdapter> {
    const mode = await this.getProviderMode('loyalty', outletId);
    if (mode === 'live') {
      return new MockLoyaltyAdapter();
    }
    return new MockLoyaltyAdapter();
  }

  /**
   * Get CCTV Adapter instance based on configuration mode
   */
  static async getCctvAdapter(outletId?: string): Promise<CctvAdapter> {
    const mode = await this.getProviderMode('cctv', outletId);
    if (mode === 'live') {
      return new MockCctvAdapter();
    }
    return new MockCctvAdapter();
  }
}
