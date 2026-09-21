import { useState, useEffect } from 'react';
import { Dish } from '../types';
import { MENU_ITEMS } from './restaurantData';

const MENU_STORAGE_KEY = 'mayflower_custom_menu_items_v2';
const MENU_UPDATE_EVENT = 'mayflower_menu_updated';

/** Retrieve currently stored menu items, falling back to default seed items */
export const getStoredMenuItems = (): Dish[] => {
  try {
    const saved = localStorage.getItem(MENU_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved menu items', e);
  }
  return [...MENU_ITEMS];
};

/** Save the full list of menu items and broadcast the update */
export const setStoredMenuItems = (items: Dish[]): void => {
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(MENU_UPDATE_EVENT, { detail: items }));
  } catch (e) {
    console.error('Failed to save menu items', e);
  }
};

/** Add a new dish to the menu */
export const addMenuItem = (dish: Omit<Dish, 'id'> & { id?: string }): Dish => {
  const current = getStoredMenuItems();
  const newDish: Dish = {
    ...dish,
    id: dish.id || 'm-custom-' + Date.now(),
  };
  const updated = [newDish, ...current];
  setStoredMenuItems(updated);
  return newDish;
};

/** Update an existing dish */
export const updateMenuItem = (id: string, updates: Partial<Dish>): Dish | null => {
  const current = getStoredMenuItems();
  const idx = current.findIndex(d => d.id === id);
  if (idx === -1) return null;
  const updatedDish: Dish = { ...current[idx], ...updates };
  current[idx] = updatedDish;
  setStoredMenuItems([...current]);
  return updatedDish;
};

/** Delete a dish by ID */
export const deleteMenuItem = (id: string): boolean => {
  const current = getStoredMenuItems();
  const filtered = current.filter(d => d.id !== id);
  if (filtered.length === current.length) return false;
  setStoredMenuItems(filtered);
  return true;
};

/** Reset menu back to standard default seed dishes */
export const resetMenuToDefaults = (): Dish[] => {
  setStoredMenuItems([...MENU_ITEMS]);
  return [...MENU_ITEMS];
};

/** React hook to keep any component in sync with menu state */
export const useMenuItems = () => {
  const [dishes, setDishes] = useState<Dish[]>(() => getStoredMenuItems());

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<Dish[]>;
      if (customEvent.detail) {
        setDishes(customEvent.detail);
      } else {
        setDishes(getStoredMenuItems());
      }
    };

    window.addEventListener(MENU_UPDATE_EVENT, handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener(MENU_UPDATE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return {
    dishes,
    addDish: addMenuItem,
    updateDish: updateMenuItem,
    deleteDish: deleteMenuItem,
  };
};
