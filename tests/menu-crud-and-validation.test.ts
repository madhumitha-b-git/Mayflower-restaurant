import { describe, it, expect, beforeEach } from 'vitest';
import { isValidEmailDomain, EMAIL_VALIDATION_MESSAGE } from '../src/lib/validation';
import {
  getStoredMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  resetMenuToDefaults,
} from '../src/data/menuStorage';
import { MENU_ITEMS } from '../src/data/restaurantData';

describe('Strict Email Domain Validation', () => {
  it('accepts valid @gmail.com and @outlook.com email formats', () => {
    expect(isValidEmailDomain('test.user@gmail.com')).toBe(true);
    expect(isValidEmailDomain('chef_john@outlook.com')).toBe(true);
    expect(isValidEmailDomain('Madan.Kumar+work@gmail.com')).toBe(true);
    expect(isValidEmailDomain('contact@outlook.com')).toBe(true);
  });

  it('rejects invalid or unsupported domains such as abs@g.com, yahoo, or corporate domains', () => {
    expect(isValidEmailDomain('abs@g.com')).toBe(false);
    expect(isValidEmailDomain('user@yahoo.com')).toBe(false);
    expect(isValidEmailDomain('user@example.com')).toBe(false);
    expect(isValidEmailDomain('user@mayflower.in')).toBe(false);
    expect(isValidEmailDomain('invalid-email')).toBe(false);
    expect(isValidEmailDomain('')).toBe(false);
    expect(isValidEmailDomain('@gmail.com')).toBe(false);
  });

  it('provides a descriptive validation message', () => {
    expect(EMAIL_VALIDATION_MESSAGE).toContain('@gmail.com or @outlook.com');
  });
});

describe('Dynamic Menu Catalog Storage & CRUD Sync', () => {
  beforeEach(() => {
    localStorage.clear();
    resetMenuToDefaults();
  });

  it('initializes with seed menu items', () => {
    const items = getStoredMenuItems();
    expect(items.length).toBe(MENU_ITEMS.length);
    expect(items[0].name).toBe(MENU_ITEMS[0].name);
  });

  it('adds a new dish offering and updates storage', () => {
    const initialCount = getStoredMenuItems().length;
    const created = addMenuItem({
      name: 'Artisan Burrata Salad',
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2252a?w=800',
      description: 'Creamy artisanal burrata with heirloom tomatoes and basil emulsion.',
      isVeg: true,
      isChefPick: true,
      category: 'starters',
      categoryName: 'Starters',
      price: 520,
      portion: '250g',
      calories: '320 kcal',
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Artisan Burrata Salad');

    const updated = getStoredMenuItems();
    expect(updated.length).toBe(initialCount + 1);
    expect(updated[0].name).toBe('Artisan Burrata Salad');
  });

  it('updates an existing dish in menu storage', () => {
    const items = getStoredMenuItems();
    const firstDish = items[0];

    const modified = updateMenuItem(firstDish.id, {
      name: 'Updated ' + firstDish.name,
      price: 999,
    });

    expect(modified).not.toBeNull();
    expect(modified?.name).toBe('Updated ' + firstDish.name);
    expect(modified?.price).toBe(999);

    const afterUpdate = getStoredMenuItems();
    const found = afterUpdate.find(d => d.id === firstDish.id);
    expect(found?.name).toBe('Updated ' + firstDish.name);
    expect(found?.price).toBe(999);
  });

  it('deletes a dish by ID and updates storage', () => {
    const items = getStoredMenuItems();
    const dishToDelete = items[0];
    const initialCount = items.length;

    const result = deleteMenuItem(dishToDelete.id);
    expect(result).toBe(true);

    const afterDelete = getStoredMenuItems();
    expect(afterDelete.length).toBe(initialCount - 1);
    expect(afterDelete.find(d => d.id === dishToDelete.id)).toBeUndefined();
  });
});
