import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidEmailDomain,
  EMAIL_VALIDATION_MESSAGE,
  cleanContactNumber,
  isValidContactNumber,
  PHONE_VALIDATION_MESSAGE,
} from '../src/lib/validation';
import {
  getStoredMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  resetMenuToDefaults,
} from '../src/data/menuStorage';
import { MENU_ITEMS } from '../src/data/restaurantData';

describe('Universal Email Domain Validation', () => {
  it('accepts all valid email providers including Gmail, Outlook, Yahoo, Hotmail, and institutional domains', () => {
    expect(isValidEmailDomain('test.user@gmail.com')).toBe(true);
    expect(isValidEmailDomain('chef_john@outlook.com')).toBe(true);
    expect(isValidEmailDomain('patron@yahoo.com')).toBe(true);
    expect(isValidEmailDomain('patron@hotmail.com')).toBe(true);
    expect(isValidEmailDomain('madankumar.s.2023.aids@ritchennai.edu.in')).toBe(true);
    expect(isValidEmailDomain('Madan.Kumar+work@gmail.com')).toBe(true);
    expect(isValidEmailDomain('contact@restaurant-domain.org')).toBe(true);
  });

  it('rejects malformed email strings or empty inputs', () => {
    expect(isValidEmailDomain('invalid-email')).toBe(false);
    expect(isValidEmailDomain('')).toBe(false);
    expect(isValidEmailDomain('@gmail.com')).toBe(false);
    expect(isValidEmailDomain('no-at-sign.com')).toBe(false);
    expect(isValidEmailDomain('user@')).toBe(false);
  });

  it('provides a descriptive validation message', () => {
    expect(EMAIL_VALIDATION_MESSAGE).toBe('Please enter a valid email address.');
  });
});

describe('10-Digit Contact Number Validation & Sanitization', () => {
  it('sanitizes input to remove non-digit characters and truncate to 10 digits', () => {
    expect(cleanContactNumber('+91 98400-12345')).toBe('9198400123');
    expect(cleanContactNumber('98765-abc-43210')).toBe('9876543210');
    expect(cleanContactNumber('98765 43210 ext 99')).toBe('9876543210');
    expect(cleanContactNumber('(987) 654-3210')).toBe('9876543210');
    expect(cleanContactNumber('letters-only')).toBe('');
  });

  it('validates exactly 10 numeric digits', () => {
    expect(isValidContactNumber('9876543210')).toBe(true);
    expect(isValidContactNumber('9840012345')).toBe(true);
    expect(isValidContactNumber('1234567890')).toBe(true);

    expect(isValidContactNumber('987654321')).toBe(false); // 9 digits
    expect(isValidContactNumber('98765432100')).toBe(false); // 11 digits
    expect(isValidContactNumber('+919876543210')).toBe(false); // special characters
    expect(isValidContactNumber('987654321a')).toBe(false); // alphabet
    expect(isValidContactNumber('')).toBe(false); // empty
  });

  it('provides appropriate validation error message', () => {
    expect(PHONE_VALIDATION_MESSAGE).toBe('Please enter a valid 10-digit mobile number (numbers only).');
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
