import React, { useState } from 'react';
import { Dish, MenuCategoryType } from '../../../types';
import { useMenuItems } from '../../../data/menuStorage';
import {
  Plus, Search, Edit3, Trash2, Check, X, Sparkles,
  UtensilsCrossed, Leaf, Flame
} from 'lucide-react';

const CATEGORIES: { key: MenuCategoryType; label: string; name: string }[] = [
  { key: 'dim-sum', label: 'Dim Sums', name: 'Dim Sums' },
  { key: 'starters', label: 'Starters', name: 'Starters' },
  { key: 'pizza', label: 'Pizzas', name: 'Pizzas' },
  { key: 'pasta', label: 'Pastas', name: 'Pastas' },
  { key: 'burgers', label: 'Burgers', name: 'Burgers' },
  { key: 'asian-bowls', label: 'Asian Bowls', name: 'Asian Bowls' },
  { key: 'desserts-beverages', label: 'Desserts & Drinks', name: 'Desserts & Drinks' },
];

export const MenuAdminPanel: React.FC = () => {
  const { dishes, addDish, updateDish, deleteDish } = useMenuItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    image: string;
    description: string;
    isVeg: boolean;
    isChefPick: boolean;
    category: MenuCategoryType;
    categoryName: string;
    price: number | string;
    portion: string;
    calories: string;
  }>({
    name: '',
    image: '',
    description: '',
    isVeg: true,
    isChefPick: false,
    category: 'starters',
    categoryName: 'Starters',
    price: '',
    portion: '',
    calories: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingDishId(null);
    setFormData({
      name: '',
      image: '',
      description: '',
      isVeg: true,
      isChefPick: false,
      category: 'starters',
      categoryName: 'Starters',
      price: '',
      portion: '',
      calories: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dish: Dish) => {
    setEditingDishId(dish.id);
    setFormData({
      name: dish.name,
      image: dish.image,
      description: dish.description,
      isVeg: dish.isVeg,
      isChefPick: !!dish.isChefPick,
      category: dish.category,
      categoryName: dish.categoryName || dish.category,
      price: dish.price,
      portion: dish.portion || '',
      calories: dish.calories || '',
    });
    setIsModalOpen(true);
  };

  const handleCategorySelect = (categoryKey: MenuCategoryType) => {
    const found = CATEGORIES.find(c => c.key === categoryKey);
    setFormData(prev => ({
      ...prev,
      category: categoryKey,
      categoryName: found ? found.name : categoryKey,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.image.trim() || !formData.description.trim() || !formData.price) {
      alert('Please fill in all required fields (Name, Image URL, Description, Price).');
      return;
    }

    const priceNum = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price in INR.');
      return;
    }

    if (editingDishId) {
      // Edit existing
      updateDish(editingDishId, {
        name: formData.name.trim(),
        image: formData.image.trim(),
        description: formData.description.trim(),
        isVeg: formData.isVeg,
        isChefPick: formData.isChefPick,
        category: formData.category,
        categoryName: formData.categoryName,
        cuisine: formData.category,
        price: priceNum,
        portion: formData.portion.trim() || undefined,
        calories: formData.calories.trim() || undefined,
      });
      showToast(`Updated "${formData.name.trim()}" successfully.`);
    } else {
      // Add new
      addDish({
        name: formData.name.trim(),
        image: formData.image.trim(),
        description: formData.description.trim(),
        isVeg: formData.isVeg,
        isChefPick: formData.isChefPick,
        category: formData.category,
        categoryName: formData.categoryName,
        cuisine: formData.category,
        price: priceNum,
        portion: formData.portion.trim() || undefined,
        calories: formData.calories.trim() || undefined,
      });
      showToast(`Added new dish "${formData.name.trim()}" to menu.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    deleteDish(id);
    setDeleteConfirmId(null);
    showToast(`Removed "${name}" from menu.`);
  };

  const filteredDishes = dishes.filter(d => {
    const matchSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchDiet =
      dietaryFilter === 'all'
        ? true
        : dietaryFilter === 'veg'
        ? d.isVeg
        : !d.isVeg;

    return matchSearch && matchCat && matchDiet;
  });

  return (
    <section className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#02150c] text-[#DFC993] border border-[#C5A880]/30 px-4 py-3 text-xs font-semibold shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-[#e4e2de] bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Menu Synced
              </span>
              <span className="text-xs text-stone-400">Total: {dishes.length} items</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#02150c] mt-1">
              Menu & Catalog Management
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl">
              Modify existing recipes, add new culinary creations, adjust prices, or remove items. All changes immediately sync across the website & customer portal in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#02150c] hover:bg-[#122e23] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#DFC993]" />
              <span>Add New Dish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-[#fbf9f5] p-3 rounded-xl border border-[#e4e2de]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search dishes by name or ingredients..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#e4e2de] bg-white py-2 pl-9 pr-3 text-xs text-stone-900 focus:outline-none focus:border-[#02150c]"
          />
        </div>

        {/* Category dropdown */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-[#e4e2de] bg-white px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
        >
          <option value="all">All Categories ({dishes.length})</option>
          {CATEGORIES.map(c => (
            <option key={c.key} value={c.key}>
              {c.label} ({dishes.filter(d => d.category === c.key).length})
            </option>
          ))}
        </select>

        {/* Dietary toggle */}
        <div className="flex items-center rounded-lg border border-[#e4e2de] bg-white p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setDietaryFilter('all')}
            className={`px-2.5 py-1.5 rounded-md transition-colors ${
              dietaryFilter === 'all' ? 'bg-[#02150c] text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setDietaryFilter('veg')}
            className={`px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
              dietaryFilter === 'veg' ? 'bg-emerald-700 text-white' : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Leaf className="w-3 h-3" /> Veg
          </button>
          <button
            type="button"
            onClick={() => setDietaryFilter('non-veg')}
            className={`px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
              dietaryFilter === 'non-veg' ? 'bg-red-700 text-white' : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <Flame className="w-3 h-3" /> Non-Veg
          </button>
        </div>
      </div>

      {/* Dish Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            className="group rounded-2xl border border-[#e4e2de] bg-[#fbf9f5] hover:bg-white hover:border-[#745b20]/40 transition-all p-4 flex flex-col justify-between shadow-2xs hover:shadow-md"
          >
            <div>
              {/* Top Image + Badges */}
              <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3 bg-stone-100 border border-stone-200">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback thumbnail if image link fails
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                
                {/* Diet Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md shadow-xs border ${
                    dish.isVeg ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300' : 'bg-rose-100/90 text-rose-900 border-rose-300'
                  }`}>
                    {dish.isVeg ? '● VEG' : '▲ NON-VEG'}
                  </span>
                </div>

                {/* Chef pick badge */}
                {dish.isChefPick && (
                  <div className="absolute top-2.5 right-2.5 bg-[#02150c]/90 text-[#DFC993] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-[#C5A880]/40">
                    <Sparkles className="w-3 h-3 text-[#C5A880]" />
                    <span>Chef Pick</span>
                  </div>
                )}
              </div>

              {/* Title and Category */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-serif font-bold text-sm text-[#02150c] leading-tight group-hover:text-[#745b20] transition-colors">
                  {dish.name}
                </h3>
                <span className="font-bold text-sm text-[#745b20] shrink-0">
                  ₹{dish.price}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                  {dish.categoryName || dish.category}
                </span>
                {dish.portion && (
                  <>
                    <span className="text-stone-300 text-[10px]">·</span>
                    <span className="text-[10px] text-stone-400 font-medium">{dish.portion}</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-light mb-4">
                {dish.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#e4e2de] flex items-center justify-between gap-2">
              <span className="text-[10px] text-stone-400 font-mono">ID: {dish.id.slice(0, 10)}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(dish)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-[#02150c] hover:text-white text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                  title="Modify dish"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmId(dish.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                  title="Delete dish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <div className="py-12 text-center text-stone-500 bg-[#fbf9f5] rounded-2xl border border-dashed border-[#e4e2de]">
          <UtensilsCrossed className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No dishes match your query</p>
          <p className="text-xs text-stone-400 mt-0.5">Try clearing filters or click "+ Add New Dish" above.</p>
        </div>
      )}

      {/* Modal: Add / Edit Dish */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-[#e4e2de] my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#e4e2de]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#745b20]">
                  {editingDishId ? 'Edit Dish Offering' : 'New Dish Creation'}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#02150c] mt-0.5">
                  {editingDishId ? 'Modify Menu Item' : 'Add New Dish to Menu'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer transition-colors text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              {/* Dish Name */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Truffle Cream Fettuccine"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#f5f3ef] text-stone-900 focus:outline-none focus:border-[#02150c]"
                />
              </div>

              {/* Image URL with live preview */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600 mb-1">
                  Image Link / URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or /dishes/..."
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#f5f3ef] text-stone-900 focus:outline-none focus:border-[#02150c]"
                />
                {formData.image && (
                  <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border"
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <span className="text-[11px] text-stone-500">Live preview thumbnail</span>
                  </div>
                )}
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => handleCategorySelect(e.target.value as MenuCategoryType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#f5f3ef] text-stone-900 focus:outline-none focus:border-[#02150c] cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600 mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="480"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#f5f3ef] text-stone-900 focus:outline-none focus:border-[#02150c]"
                  />
                </div>
              </div>

              {/* Veg / Non-Veg Toggle & Chef Pick */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-stone-600 mb-1.5">
                    Dietary Type *
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isVeg: true })}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1 cursor-pointer border ${
                        formData.isVeg
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <Leaf className="w-3.5 h-3.5" /> Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isVeg: false })}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1 cursor-pointer border ${
                        !formData.isVeg
                          ? 'bg-red-700 text-white border-red-800 shadow-xs'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" /> Non-Veg
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isChefPick}
                      onChange={e => setFormData({ ...formData, isChefPick: e.target.checked })}
                      className="rounded text-[#02150c] focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" /> Chef's Signature Pick
                    </span>
                  </label>
                </div>
              </div>

              {/* Portion & Calories (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600 mb-1">
                    Portion (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 pcs / 11 inch"
                    value={formData.portion}
                    onChange={e => setFormData({ ...formData, portion: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-[#f5f3ef] text-stone-900 focus:outline-none focus:border-[#02150c]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600 mb-1">
                    Calories (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 380 kcal"
                    value={formData.calories}
                    onChange={e => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-[#f5f3ef] text-stone-900 focus:outline-none focus:border-[#02150c]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600 mb-1">
                  Culinary Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed description of flavors, ingredients, sauces, and culinary preparation..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#f5f3ef] text-stone-900 focus:outline-none focus:border-[#02150c]"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-stone-200 font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#02150c] hover:bg-[#122e23] text-white font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                >
                  {editingDishId ? 'Save Modifications' : 'Publish to Live Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-rose-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-900">Remove Dish from Menu?</h4>
            <p className="text-xs text-stone-500 mt-1 mb-5">
              This will immediately remove the dish from both the Admin Catalog and the public website menu.
            </p>
            <div className="flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = dishes.find(d => d.id === deleteConfirmId);
                  if (target) handleDelete(target.id, target.name);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
