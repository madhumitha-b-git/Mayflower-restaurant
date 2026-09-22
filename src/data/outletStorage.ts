import { useState, useEffect } from 'react';
import { LocationOutlet, UserProfile } from '../types';
import { OUTLETS as DEFAULT_OUTLETS } from './restaurantData';
import {
  canCreateOutlet,
  canEditOutlet,
  canPublishOutlet,
  canDeleteOutlet,
} from '../rbac/policies';

const OUTLET_STORAGE_KEY = 'mayflower_outlets_v2';
const OUTLET_UPDATE_EVENT = 'mayflower_outlets_updated';

export const INITIAL_OUTLET_STORAGE: LocationOutlet[] = DEFAULT_OUTLETS.map((o, idx) => ({
  ...o,
  email: `sanctuary.${o.id}@mayflower.in`,
  status: 'Published',
  tablesCount: [24, 18, 20, 16][idx] || 20,
  coversCount: [96, 72, 80, 64][idx] || 80,
  assignedMenuCategories: ['dim-sum', 'starters', 'pizza', 'pasta', 'asian-bowls', 'desserts-beverages'],
  currentLoadTables: [18, 14, 15, 11][idx] || 12,
  maxTables: [24, 18, 20, 16][idx] || 20,
  capacityPercent: [75, 78, 75, 68][idx] || 70,
  reservedWave: [
    '6 Tables Reserved (Dinner Wave)',
    '4 Deck Lounges Open',
    '8 Tables Reserved for Evening',
    '5 Solarium Terraces Reserved',
  ][idx] || 'Live reservations active',
  statusNote: [
    "Chef's Glasshouse Occupied",
    'Sea Deck High Demand',
    'Main Dining Hall at Capacity',
    'Terrace Lounge Open',
  ][idx] || 'Operational',
  posId: `POS-0${idx + 1} (ONLINE)`,
  posStatus: 'ONLINE',
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
}));

/** Retrieve all stored outlets (both Draft and Published) */
export const getStoredOutlets = (): LocationOutlet[] => {
  try {
    const raw = localStorage.getItem(OUTLET_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved outlets', e);
  }
  return [...INITIAL_OUTLET_STORAGE];
};

/** Retrieve only Published outlets for live public website & customer reservation flows */
export const getPublishedOutlets = (): LocationOutlet[] => {
  const all = getStoredOutlets();
  return all.filter((o) => o.status === 'Published' || !o.status);
};

/** Save the full list of outlets and broadcast update to all tabs/components */
export const setStoredOutlets = (outlets: LocationOutlet[]): void => {
  try {
    localStorage.setItem(OUTLET_STORAGE_KEY, JSON.stringify(outlets));
    window.dispatchEvent(new CustomEvent(OUTLET_UPDATE_EVENT, { detail: outlets }));
  } catch (e) {
    console.error('Failed to save outlets', e);
  }
};

export interface CreateOutletInput {
  name: string;
  tagline?: string;
  address: string;
  hours: string;
  phone: string;
  email?: string;
  description?: string;
  image?: string;
  icon?: string;
  mapCoordinates?: { x: number; y: number };
  highlights?: string[];
  gmapUrl?: string;
  status?: 'Published' | 'Draft';
  tablesCount?: number;
  coversCount?: number;
  assignedMenuCategories?: string[];
}

/** Create a new outlet (Super Admin only) */
export const createOutlet = (
  actor: UserProfile,
  payload: CreateOutletInput
): { success: boolean; outlet?: LocationOutlet; error?: string } => {
  if (!canCreateOutlet(actor)) {
    return { success: false, error: 'Unauthorized: Only Super Admin can create outlets.' };
  }

  if (!payload.name?.trim() || !payload.address?.trim() || !payload.phone?.trim() || !payload.hours?.trim()) {
    return { success: false, error: 'Name, address, contact phone, and operating hours are required.' };
  }

  const current = getStoredOutlets();
  const slug = payload.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `outlet-${Date.now()}`;

  const defaultImage =
    payload.image ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';

  const tablesCount = payload.tablesCount || 16;
  const coversCount = payload.coversCount || tablesCount * 4;

  const newOutlet: LocationOutlet = {
    id: slug,
    name: payload.name.trim(),
    tagline: payload.tagline?.trim() || 'Mayflower Dining Sanctuary',
    address: payload.address.trim(),
    hours: payload.hours.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || `sanctuary.${slug}@mayflower.in`,
    description: payload.description?.trim() || 'A premier dining sanctuary offering crafted dishes and artisanal beverages.',
    image: defaultImage,
    icon: payload.icon || 'Store',
    mapCoordinates: payload.mapCoordinates || { x: 50, y: 50 },
    highlights: payload.highlights && payload.highlights.length > 0
      ? payload.highlights
      : ['Craft Cuisine', 'Artisanal Beverages', 'Valet Parking', 'Air Conditioned'],
    gmapUrl: payload.gmapUrl || `https://maps.google.com/?q=Mayflower+${encodeURIComponent(payload.name)}+Chennai`,
    status: payload.status || 'Draft',
    tablesCount,
    coversCount,
    assignedMenuCategories: payload.assignedMenuCategories || ['all'],
    currentLoadTables: 0,
    maxTables: tablesCount,
    capacityPercent: 0,
    reservedWave: 'Accepting initial reservations',
    statusNote: payload.status === 'Published' ? 'Live on Website' : 'Draft / Staging',
    posId: `POS-0${current.length + 1} (ONLINE)`,
    posStatus: 'ONLINE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newOutlet, ...current];
  setStoredOutlets(updated);
  return { success: true, outlet: newOutlet };
};

/** Update an existing outlet (Super Admin only) */
export const updateOutlet = (
  actor: UserProfile,
  id: string,
  updates: Partial<LocationOutlet>
): { success: boolean; outlet?: LocationOutlet; error?: string } => {
  if (!canEditOutlet(actor)) {
    return { success: false, error: 'Unauthorized: Only Super Admin can edit outlets.' };
  }

  const current = getStoredOutlets();
  const index = current.findIndex((o) => o.id === id);
  if (index === -1) {
    return { success: false, error: 'Outlet not found.' };
  }

  const updatedOutlet: LocationOutlet = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updatedOutlet;
  setStoredOutlets([...current]);
  return { success: true, outlet: updatedOutlet };
};

/** Toggle outlet publish state (Draft <-> Published) (Super Admin only) */
export const toggleOutletPublish = (
  actor: UserProfile,
  id: string,
  publish: boolean
): { success: boolean; outlet?: LocationOutlet; error?: string } => {
  if (!canPublishOutlet(actor)) {
    return { success: false, error: 'Unauthorized: Only Super Admin can publish or unpublish outlets.' };
  }

  return updateOutlet(actor, id, {
    status: publish ? 'Published' : 'Draft',
    statusNote: publish ? 'Live on Website' : 'Draft / Staging',
  });
};

/** Delete an outlet (Super Admin only) */
export const deleteOutlet = (
  actor: UserProfile,
  id: string
): { success: boolean; error?: string } => {
  if (!canDeleteOutlet(actor)) {
    return { success: false, error: 'Unauthorized: Only Super Admin can delete outlets.' };
  }

  const current = getStoredOutlets();
  const filtered = current.filter((o) => o.id !== id);
  if (filtered.length === current.length) {
    return { success: false, error: 'Outlet not found.' };
  }

  setStoredOutlets(filtered);
  return { success: true };
};

/** Custom React Hook for reactive outlet synchronization across views and tabs */
export const useOutlets = (user?: UserProfile | null) => {
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Owner';

  const [outlets, setOutlets] = useState<LocationOutlet[]>(() => {
    return isSuperAdmin || isAdminOrManager ? getStoredOutlets() : getPublishedOutlets();
  });

  useEffect(() => {
    const handleUpdate = () => {
      const all = getStoredOutlets();
      if (isSuperAdmin || isAdminOrManager) {
        setOutlets(all);
      } else {
        setOutlets(all.filter((o) => o.status === 'Published' || !o.status));
      }
    };

    window.addEventListener(OUTLET_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(OUTLET_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [isSuperAdmin, isAdminOrManager]);

  return {
    outlets,
    publishedOutlets: outlets.filter((o) => o.status === 'Published' || !o.status),
    draftOutlets: outlets.filter((o) => o.status === 'Draft'),
    reload: () => {
      const all = getStoredOutlets();
      setOutlets(isSuperAdmin || isAdminOrManager ? all : all.filter((o) => o.status === 'Published' || !o.status));
    },
  };
};