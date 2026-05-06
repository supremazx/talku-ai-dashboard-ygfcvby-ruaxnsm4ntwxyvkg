import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tenant } from '@shared/types';
/**
 * TENANT STORE LAW:
 * 1. useTenantStore(s => s.primitive) ONLY.
 * 2. NO object/array selectors.
 * 3. NO destructuring in components.
 */
interface TenantState {
  activeTenantId: string;
  // Note: activeTenant is stored but should be accessed carefully or derived from ID + List
  activeTenant: Tenant | null;
  setTenant: (tenant: Tenant) => void;
  clearTenant: () => void;
}
export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeTenantId: 'tenant-1',
      activeTenant: null,
      setTenant: (tenant: Tenant) => {
        if (!tenant || !tenant.id) return;
        set({ activeTenant: tenant, activeTenantId: tenant.id });
      },
      clearTenant: () => set({ activeTenantId: 'tenant-1', activeTenant: null }),
    }),
    {
      name: 'talku-tenant-storage',
      // Ensure we only persist the ID to avoid stale object data across sessions
      partialize: (state) => ({ activeTenantId: state.activeTenantId }),
    }
  )
);