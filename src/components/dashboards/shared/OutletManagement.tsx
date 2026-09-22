import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Globe,
  CheckCircle2,
  AlertTriangle,
  X,
  LayoutGrid,
  ChevronRight,
  Compass,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { LocationOutlet, UserProfile } from '../../../types';
import {
  useOutlets,
  createOutlet,
  updateOutlet,
  toggleOutletPublish,
  deleteOutlet,
  CreateOutletInput,
} from '../../../data/outletStorage';
import { canCreateOutlet } from '../../../rbac/policies';

interface OutletManagementProps {
  user?: UserProfile | null;
}

const PRESET_IMAGES = [
  { label: 'Glasshouse Flagship', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Seaside Promenade', url: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Heritage Espresso Bar', url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Terrace Solarium', url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Modern Bistro', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' },
];

const AVAILABLE_CATEGORIES = [
  { id: 'dim-sum', label: 'Dim Sum' },
  { id: 'starters', label: 'Starters & Small Plates' },
  { id: 'pizza', label: 'Artisanal Pizza' },
  { id: 'pasta', label: 'Fresh Pasta' },
  { id: 'burgers', label: 'Gourmet Burgers' },
  { id: 'asian-bowls', label: 'Asian Bowls' },
  { id: 'desserts-beverages', label: 'Desserts & Beverages' },
];

export const OutletManagement: React.FC<OutletManagementProps> = ({ user }) => {
  const { outlets } = useOutlets(user);
  const isSuperAdminUser = canCreateOutlet(user);

  // State
  const [selectedOutlet, setSelectedOutlet] = useState<LocationOutlet | null>(null);
  const [floorplanOutlet, setFloorplanOutlet] = useState<LocationOutlet | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingOutletId, setEditingOutletId] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Published' | 'Draft'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const initialFormState: CreateOutletInput = {
    name: '',
    tagline: '',
    address: '',
    hours: '11:00 AM – 11:00 PM (Daily)',
    phone: '80981 89000',
    email: '',
    description: '',
    image: PRESET_IMAGES[0].url,
    icon: 'Store',
    mapCoordinates: { x: 50, y: 50 },
    highlights: ['Valet Parking', 'Glasshouse Dining', 'Pet Friendly'],
    gmapUrl: '',
    status: 'Draft',
    tablesCount: 20,
    coversCount: 80,
    assignedMenuCategories: ['dim-sum', 'starters', 'pizza', 'pasta', 'asian-bowls', 'desserts-beverages'],
  };

  const [formData, setFormData] = useState<CreateOutletInput>(initialFormState);
  const [highlightsInput, setHighlightsInput] = useState('Valet Parking, Glasshouse Dining, Pet Friendly');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Create Wizard
  const handleOpenCreate = () => {
    if (!isSuperAdminUser) return;
    setEditingOutletId(null);
    setFormData(initialFormState);
    setHighlightsInput('Valet Parking, Glasshouse Dining, Pet Friendly');
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  // Open Edit Wizard
  const handleOpenEdit = (outlet: LocationOutlet) => {
    if (!isSuperAdminUser) return;
    setEditingOutletId(outlet.id);
    setFormData({
      name: outlet.name,
      tagline: outlet.tagline,
      address: outlet.address,
      hours: outlet.hours,
      phone: outlet.phone,
      email: outlet.email || '',
      description: outlet.description,
      image: outlet.image,
      icon: outlet.icon || 'Store',
      mapCoordinates: outlet.mapCoordinates || { x: 50, y: 50 },
      highlights: outlet.highlights || [],
      gmapUrl: outlet.gmapUrl || '',
      status: outlet.status || 'Draft',
      tablesCount: outlet.tablesCount || 20,
      coversCount: outlet.coversCount || 80,
      assignedMenuCategories: outlet.assignedMenuCategories || ['all'],
    });
    setHighlightsInput((outlet.highlights || []).join(', '));
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  // Handle Form Save
  const handleSaveOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isSuperAdminUser) {
      showToast('Unauthorized: Super Admin permissions required.', 'error');
      return;
    }

    const cleanedHighlights = highlightsInput
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    const payload: CreateOutletInput = {
      ...formData,
      highlights: cleanedHighlights,
      email: formData.email?.trim() || `sanctuary.${formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'outlet'}@mayflower.in`,
    };

    if (editingOutletId) {
      const res = updateOutlet(user, editingOutletId, payload);
      if (res.success) {
        showToast(`Outlet "${payload.name}" updated successfully.`);
        setIsWizardOpen(false);
      } else {
        showToast(res.error || 'Failed to update outlet', 'error');
      }
    } else {
      const res = createOutlet(user, payload);
      if (res.success) {
        showToast(`New outlet "${payload.name}" created successfully (${payload.status === 'Published' ? 'Published Live' : 'Draft'}).`);
        setIsWizardOpen(false);
      } else {
        showToast(res.error || 'Failed to create outlet', 'error');
      }
    }
  };

  // Handle Quick Publish Toggle
  const handleTogglePublish = (outlet: LocationOutlet) => {
    if (!user || !isSuperAdminUser) {
      showToast('Unauthorized: Super Admin permissions required.', 'error');
      return;
    }
    const willPublish = outlet.status !== 'Published';
    const res = toggleOutletPublish(user, outlet.id, willPublish);
    if (res.success) {
      showToast(
        willPublish
          ? `✓ "${outlet.name}" published live to the public website!`
          : `"${outlet.name}" set to Draft (hidden from public website).`
      );
    } else {
      showToast(res.error || 'Failed to toggle publish state', 'error');
    }
  };

  // Handle Delete
  const handleDelete = (outlet: LocationOutlet) => {
    if (!user || !isSuperAdminUser) {
      showToast('Unauthorized: Super Admin permissions required.', 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete "${outlet.name}"?`)) {
      const res = deleteOutlet(user, outlet.id);
      if (res.success) {
        showToast(`Outlet "${outlet.name}" removed.`);
      } else {
        showToast(res.error || 'Failed to delete outlet', 'error');
      }
    }
  };

  // Category checkbox toggle
  const toggleCategory = (catId: string) => {
    const current = formData.assignedMenuCategories || [];
    if (current.includes(catId)) {
      setFormData({
        ...formData,
        assignedMenuCategories: current.filter((c) => c !== catId),
      });
    } else {
      setFormData({
        ...formData,
        assignedMenuCategories: [...current, catId],
      });
    }
  };

  // Filter & Search
  const filteredOutlets = outlets.filter((o) => {
    if (filterStatus === 'Published' && o.status !== 'Published') return false;
    if (filterStatus === 'Draft' && o.status === 'Published') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        (o.tagline && o.tagline.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPublished = outlets.filter((o) => o.status === 'Published' || !o.status).length;
  const totalDraft = outlets.filter((o) => o.status === 'Draft').length;
  const totalCovers = outlets.reduce((acc, o) => acc + (o.coversCount || 0), 0);
  const totalTables = outlets.reduce((acc, o) => acc + (o.tablesCount || 0), 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-mono transition-all animate-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-[#0E1B15] text-emerald-300 border border-emerald-500/40'
              : 'bg-red-950 text-red-300 border border-red-500/40'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header & RBAC Banner */}
      <div className="bg-[#FAF8F3] border border-[#E8E4DB] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#8F7C4E] font-bold">
                MULTI-OUTLET MANAGEMENT
              </span>
              <span className="text-stone-300">•</span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isSuperAdminUser
                    ? 'bg-[#0E1B15] text-[#C29B38]'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {isSuperAdminUser
                  ? 'Super Admin: Full CRUD & Live Publishing'
                  : 'Role: View-Only Access (Admin/Manager)'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#14201A] mt-1">
              Mayflower Sanctuaries & Branch Outlets
            </h1>
            <p className="text-xs text-[#5B6761] mt-1 max-w-3xl leading-relaxed">
              Every restaurant record (reservations, tables, menu items, and SOP checklists) associates directly with an outlet. Super Admins configure branch settings and approve live publication to the public website.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isSuperAdminUser ? (
              <button
                id="btn-create-outlet"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E1B15] hover:bg-[#1A2E24] text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C29B38]" />
                <span>+ Create New Outlet</span>
              </button>
            ) : (
              <div className="text-xs text-stone-500 bg-white border border-stone-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>View-only mode active</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E8E4DB]">
          <div className="p-3 bg-white rounded-xl border border-[#EDE8DC]">
            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Total Branches</div>
            <div className="text-xl font-serif font-bold text-[#14201A] mt-0.5">{outlets.length} Outlets</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#EDE8DC]">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">Live Published</div>
            <div className="text-xl font-serif font-bold text-emerald-800 mt-0.5">{totalPublished} Visible</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#EDE8DC]">
            <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">Draft / Staging</div>
            <div className="text-xl font-serif font-bold text-amber-800 mt-0.5">{totalDraft} Internal</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#EDE8DC]">
            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Total Capacity</div>
            <div className="text-xl font-serif font-bold text-[#14201A] mt-0.5">{totalCovers} Covers ({totalTables} Tables)</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E8E4DB]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, address, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-2 rounded-lg bg-[#FAF8F3] border border-[#E0DBD0] text-xs focus:outline-none focus:border-[#8F7C4E]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-stone-500 font-medium">Status:</span>
          {(['All', 'Published', 'Draft'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#0E1B15] text-white'
                  : 'bg-[#FAF8F3] text-stone-600 hover:text-black border border-[#E0DBD0]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Outlets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOutlets.map((outlet) => {
          const isPublished = outlet.status === 'Published' || !outlet.status;

          return (
            <div
              key={outlet.id}
              id={`outlet-card-${outlet.id}`}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition flex flex-col ${
                isPublished ? 'border-[#E5E1D6]' : 'border-amber-300 bg-amber-50/20'
              }`}
            >
              {/* Card Header & Badges */}
              <div className="p-6 pb-4 flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#8F7C4E] font-bold">
                    {outlet.tagline || 'SANCTUARY BRANCH'}
                  </span>
                  <div className="flex items-center gap-2">
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#14261F] text-[#4ADE80]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE PUBLISHED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        DRAFT (HIDDEN)
                      </span>
                    )}
                  </div>
                </div>

                {/* Outlet Title & Address */}
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#14201A]">
                    {outlet.name}
                  </h3>
                  <div className="flex items-start gap-1.5 text-xs text-[#5B6761] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8F7C4E] shrink-0 mt-0.5" />
                    <span>{outlet.address}</span>
                  </div>
                </div>

                {/* Contact & Hours Info Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-[#FAF8F3] rounded-xl border border-[#EDE8DC] text-xs">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Clock className="w-3.5 h-3.5 text-[#8F7C4E]" />
                    <span className="truncate">{outlet.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <Phone className="w-3.5 h-3.5 text-[#8F7C4E]" />
                    <span>{outlet.phone}</span>
                  </div>
                  {outlet.email && (
                    <div className="flex items-center gap-2 text-stone-700 sm:col-span-2">
                      <Mail className="w-3.5 h-3.5 text-[#8F7C4E]" />
                      <span className="truncate">{outlet.email}</span>
                    </div>
                  )}
                </div>

                {/* Capacity Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[11px] text-stone-600">
                      SEATING CAPACITY:{' '}
                      <strong className="text-black font-bold">
                        {outlet.tablesCount || 16} Tables / {outlet.coversCount || 64} Covers
                      </strong>
                    </span>
                    <span className="font-mono text-xs font-bold text-[#8C6D28]">
                      {outlet.capacityPercent || 70}% LOAD
                    </span>
                  </div>
                  <div className="w-full bg-[#EAE5D9] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#C29B38] to-[#8F7C4E] h-full rounded-full"
                      style={{ width: `${outlet.capacityPercent || 70}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                    <span>{outlet.reservedWave || 'Active dining waves'}</span>
                    <span className="font-medium text-stone-800">{outlet.statusNote || 'Operational'}</span>
                  </div>
                </div>

                {/* Photo & Tag Overlay */}
                <div className="relative rounded-xl overflow-hidden h-44 bg-stone-900 group shadow-inner">
                  <img
                    src={outlet.image}
                    alt={outlet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#EADBBD] bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs border border-white/10">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{isPublished ? 'PUBLIC ON WEBSITE' : 'INTERNAL STAGING'}</span>
                    </div>
                    {outlet.gmapUrl && (
                      <a
                        href={outlet.gmapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-white hover:text-[#C29B38] flex items-center gap-1 bg-black/60 px-2 py-1 rounded backdrop-blur-xs"
                      >
                        <Compass className="w-3 h-3" />
                        <span>Google Map</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Highlights Pills */}
                {outlet.highlights && outlet.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {outlet.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-[#F5F1EB] text-stone-700 px-2.5 py-0.5 rounded-md border border-[#E0DBD0]"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="p-4 bg-[#FAF9F5] border-t border-[#EDE8DE] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => setSelectedOutlet(outlet)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#D9D6CB] bg-white hover:bg-[#F3EFE6] text-xs font-semibold text-stone-800 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#8F7C4E]" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => setFloorplanOutlet(outlet)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#D9D6CB] bg-white hover:bg-[#F3EFE6] text-xs font-semibold text-stone-800 transition cursor-pointer"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-[#8F7C4E]" />
                    <span>Tables Floorplan</span>
                  </button>
                </div>

                {/* Super Admin exclusive actions */}
                {isSuperAdminUser && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(outlet)}
                      title={isPublished ? 'Unpublish to Draft' : 'Publish live to website'}
                      className={`inline-flex items-center gap-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isPublished
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                          : 'bg-[#0E1B15] hover:bg-[#1A2E24] text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{isPublished ? 'Unpublish' : 'Publish Live'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(outlet)}
                      title="Edit Outlet Configuration"
                      className="p-2 rounded-lg border border-[#D9D6CB] bg-white hover:bg-[#F3EFE6] text-stone-700 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(outlet)}
                      title="Delete Outlet"
                      className="p-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Step Outlet Create / Edit Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#C29B38] max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EDE8DC] pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#8F7C4E] font-bold">
                  SUPER ADMIN OUTLET BUILDER
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#14201A]">
                  {editingOutletId ? 'Edit Outlet Configuration' : 'Create New Restaurant Branch'}
                </h2>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wizard Steps Tabs */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              {[
                { num: 1, title: '1. Basic Info' },
                { num: 2, title: '2. Media & Map' },
                { num: 3, title: '3. Service Config' },
                { num: 4, title: '4. Publish & Live' },
              ].map((step) => (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setWizardStep(step.num)}
                  className={`py-2 px-2 rounded-lg transition ${
                    wizardStep === step.num
                      ? 'bg-[#0E1B15] text-white shadow-xs'
                      : wizardStep > step.num
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-[#FAF8F3] text-stone-500 border border-[#EDE8DC]'
                  }`}
                >
                  {step.title}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveOutlet} className="space-y-4">
              {/* STEP 1: Basic Info */}
              {wizardStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Outlet Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., T. Nagar Luxury Pavilion"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D6CB] bg-[#FAF8F3] text-xs focus:outline-none focus:border-[#8F7C4E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Full Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g., No. 45, Usman Road, T. Nagar, Chennai – 600017"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D6CB] bg-[#FAF8F3] text-xs focus:outline-none focus:border-[#8F7C4E]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="80981 89000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#D9D6CB] bg-[#FAF8F3] text-xs focus:outline-none focus:border-[#8F7C4E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Operating Hours *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="11:00 AM – 11:00 PM (Daily)"
                        value={formData.hours}
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#D9D6CB] bg-[#FAF8F3] text-xs focus:outline-none focus:border-[#8F7C4E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Sanctuary Email
                    </label>
                    <input
                      type="email"
                      placeholder="sanctuary.tnagar@mayflower.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D9D6CB] bg-[#FAF8F3] text-xs focus:outline-none focus:border-[#8F7C4E]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Media & Map */}
              {wizardStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Tagline / Vibe
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Two-Level Solarium & Sunset Lounge"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D9D6CB] bg-[#FAF8F3] text-xs focus:outline-none focus:border-[#8F7C4E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Description / Story
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe the architectural atmosphere, signature spaces, and dining experience..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D9D6CB] bg-[#FAF8F3] text-xs focus:outline-none focus:border-[#8F7C4E]"
                    />
                  </div>

                  {/* Image Presets Picker */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Hero Photography Preset
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: img.url })}
                          className={`p-1.5 rounded-xl border text-left transition ${
                            formData.image === img.url
                              ? 'border-[#8F7C4E] bg-[#FAF8F3] ring-2 ring-[#8F7C4E]/30'
                              : 'border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.label}
                            className="w-full h-14 object-cover rounded-lg mb-1"
                          />
                          <span className="text-[10px] font-semibold text-stone-700 truncate block">
                            {img.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Custom Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D9D6CB] bg-[#FAF8F3] text-xs focus:outline-none focus:border-[#8F7C4E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Highlights / Amenities (comma separated)
                    </label>
                    <input
                      type="text"
                      value={highlightsInput}
                      onChange={(e) => setHighlightsInput(e.target.value)}
                      placeholder="Glasshouse Seating, Valet Parking, Outdoor Courtyard, Pet Friendly"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D9D6CB] bg-[#FAF8F3] text-xs focus:outline-none focus:border-[#8F7C4E]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Service Config */}
              {wizardStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Tables Count *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.tablesCount}
                        onChange={(e) => {
                          const count = parseInt(e.target.value, 10) || 16;
                          setFormData({
                            ...formData,
                            tablesCount: count,
                            coversCount: count * 4,
                          });
                        }}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#D9D6CB] bg-[#FAF8F3] text-xs focus:outline-none focus:border-[#8F7C4E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Covers Capacity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={formData.coversCount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coversCount: parseInt(e.target.value, 10) || 64,
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#D9D6CB] bg-[#FAF8F3] text-xs focus:outline-none focus:border-[#8F7C4E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Assigned Menu Categories
                    </label>
                    <p className="text-[11px] text-stone-500 mb-2">
                      Select which menu catalogs are actively prepared and served at this branch:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_CATEGORIES.map((cat) => {
                        const isChecked = (formData.assignedMenuCategories || []).includes(cat.id);
                        return (
                          <label
                            key={cat.id}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition ${
                              isChecked
                                ? 'bg-[#0E1B15] text-white border-[#0E1B15]'
                                : 'bg-[#FAF8F3] text-stone-700 border-[#EDE8DC] hover:border-stone-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategory(cat.id)}
                              className="accent-[#C29B38]"
                            />
                            <span>{cat.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Publish & Live */}
              {wizardStep === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-[#FAF8F3] rounded-2xl border border-[#EDE8DC] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-stone-900">
                          Live Publication Status
                        </div>
                        <p className="text-xs text-stone-500">
                          Controls whether this outlet is visible to customers on the public website and reservation picker.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            status: formData.status === 'Published' ? 'Draft' : 'Published',
                          })
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                          formData.status === 'Published'
                            ? 'bg-[#14261F] text-[#4ADE80] border border-emerald-500/40'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span>
                          {formData.status === 'Published' ? '✓ PUBLISHED' : 'DRAFT / STAGING'}
                        </span>
                      </button>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                      <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Instant Website Synchronization:</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {formData.status === 'Published'
                          ? 'This outlet will immediately appear on the Chennai locations map, locations grid, and in the customer reservation branch picker.'
                          : 'This outlet will remain hidden from customers until approved and published by Super Admin.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation & Action Buttons */}
              <div className="flex items-center justify-between border-t border-[#EDE8DC] pt-4">
                <div>
                  {wizardStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setWizardStep(wizardStep - 1)}
                      className="px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {wizardStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep(wizardStep + 1)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0E1B15] hover:bg-[#1A2E24] text-xs font-bold text-white cursor-pointer"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0E1B15] hover:bg-[#1A2E24] text-xs font-bold text-[#C29B38] border border-[#C29B38]/40 shadow-sm cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingOutletId ? 'Save Changes' : 'Confirm & Save Outlet'}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Floorplan Inspection Modal */}
      {floorplanOutlet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#C29B38] max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ECE7DC] pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#967C3B] font-bold">
                  FLOORPLAN & TABLE SETUP MATRIX
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#18231F]">
                  {floorplanOutlet.name} — Table Layout
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Total Capacity: {floorplanOutlet.tablesCount || 16} Tables ({floorplanOutlet.coversCount || 64} Covers)
                </p>
              </div>
              <button
                onClick={() => setFloorplanOutlet(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table layout cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              {Array.from({ length: floorplanOutlet.tablesCount || 16 }).map((_, idx) => {
                const tableNum = idx + 1;
                const isOccupied = idx < Math.round((floorplanOutlet.tablesCount || 16) * 0.6);
                const isReserved = !isOccupied && idx % 2 === 0;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col justify-between ${
                      isOccupied
                        ? 'bg-red-50/60 border-red-200 text-red-900'
                        : isReserved
                        ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                        : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm">Table T-{tableNum}</span>
                      <span className="text-[10px] font-mono font-semibold uppercase">
                        {isOccupied ? 'Occupied' : isReserved ? 'Reserved' : 'Available'}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 mt-2">
                      Seats: 4 Covers
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#ECE7DC]">
              <button
                onClick={() => setFloorplanOutlet(null)}
                className="px-5 py-2 rounded-xl bg-[#0E1B15] text-white text-xs font-semibold cursor-pointer"
              >
                Close Floorplan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outlet Details Modal */}
      {selectedOutlet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#C29B38] max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ECE7DC] pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#967C3B] font-bold">
                  SANCTUARY SPECIFICATION
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#18231F]">
                  {selectedOutlet.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOutlet(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={selectedOutlet.image}
              alt={selectedOutlet.name}
              className="w-full h-48 object-cover rounded-xl border border-stone-200"
            />

            <div className="space-y-2 text-xs text-stone-700">
              <p><strong>Tagline:</strong> {selectedOutlet.tagline}</p>
              <p><strong>Address:</strong> {selectedOutlet.address}</p>
              <p><strong>Hours:</strong> {selectedOutlet.hours}</p>
              <p><strong>Phone:</strong> {selectedOutlet.phone}</p>
              <p><strong>Email:</strong> {selectedOutlet.email || 'N/A'}</p>
              <p><strong>Description:</strong> {selectedOutlet.description}</p>
              <p><strong>Status:</strong> <span className={`font-bold ${selectedOutlet.status === 'Published' ? 'text-emerald-700' : 'text-amber-700'}`}>{selectedOutlet.status || 'Published'}</span></p>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#ECE7DC]">
              <button
                onClick={() => setSelectedOutlet(null)}
                className="px-5 py-2 rounded-xl bg-[#0E1B15] text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};