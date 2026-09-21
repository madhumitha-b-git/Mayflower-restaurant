import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Building2, Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { getDataProvider } from '../data/DataProvider';

interface FranchiseEnquiryFormProps {
  user: UserProfile | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FranchiseEnquiryForm({ user, onClose, onSuccess }: FranchiseEnquiryFormProps) {
  const dataProvider = getDataProvider();
  
  const [formData, setFormData] = useState({
    applicantName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cityInterested: '',
    investmentBudget: '₹50L - 1Cr',
    priorExperience: false,
    message: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        customerId: user?.id
      };
      const enquiry = await dataProvider.submitFranchiseEnquiry(payload);
      
      if (files.length > 0 && user) {
        await dataProvider.uploadFranchiseDocuments(user, enquiry.id, files);
      }
      
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert('Error submitting enquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-md p-8 relative shadow-2xl border border-[#E8E4DB] text-center">
          <CheckCircle2 className="w-16 h-16 text-[#2D4030] mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-[#1A1A1A] mb-2">Enquiry Submitted!</h2>
          <p className="text-sm text-[#5A5A40] mb-6">
            Thank you for your interest in Mayflower. Our expansion team will review your application and get in touch within 3-5 business days.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#2D4030] hover:bg-[#1F3022] text-white rounded-xl font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex min-h-full items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8E4DB] overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 md:p-8 pb-4 shrink-0 flex items-center justify-between border-b border-[#E8E4DB]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-xs border border-[#E8E4DB] flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-[#2D4030]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-medium text-[#1A1A1A]">Franchise Enquiry</h2>
              <p className="text-sm text-[#5A5A40]">Partner with the Mayflower legacy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-stone-200 border border-[#E8E4DB] flex items-center justify-center text-stone-600 hover:text-black transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 md:p-8 pt-5 overflow-y-auto space-y-5 flex-1">
            
            {/* Row 1: Full Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#5A5A40] mb-2">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.applicantName}
                  onChange={e => setFormData(prev => ({ ...prev, applicantName: e.target.value }))}
                  className="w-full h-11 px-4 bg-white border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#2D4030] focus:ring-1 focus:ring-[#2D4030]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#5A5A40] mb-2">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-11 px-4 bg-white border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#2D4030] focus:ring-1 focus:ring-[#2D4030]"
                />
              </div>
            </div>

            {/* Row 2: Phone & City of Interest */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#5A5A40] mb-2">
                  Phone
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full h-11 px-4 bg-white border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#2D4030] focus:ring-1 focus:ring-[#2D4030]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#5A5A40] mb-2">
                  City of Interest
                </label>
                <input
                  required
                  type="text"
                  value={formData.cityInterested}
                  onChange={e => setFormData(prev => ({ ...prev, cityInterested: e.target.value }))}
                  className="w-full h-11 px-4 bg-white border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#2D4030] focus:ring-1 focus:ring-[#2D4030]"
                />
              </div>
            </div>

            {/* Row 3: Investment Budget & Hospitality Experience (Properly aligned with labels and height) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#5A5A40] mb-2">
                  Investment Budget
                </label>
                <select
                  value={formData.investmentBudget}
                  onChange={e => setFormData(prev => ({ ...prev, investmentBudget: e.target.value }))}
                  className="w-full h-11 px-4 bg-white border border-[#E8E4DB] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#2D4030] focus:ring-1 focus:ring-[#2D4030]"
                >
                  <option value="₹50L - 1Cr">₹50L - 1Cr</option>
                  <option value="₹1Cr - 5Cr">₹1Cr - 5Cr</option>
                  <option value="₹5Cr+">₹5Cr+</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#5A5A40] mb-2">
                  Hospitality Background
                </label>
                <div className="w-full h-11 px-4 bg-white border border-[#E8E4DB] rounded-xl flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1A1A1A]">Prior F&B Experience?</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.priorExperience}
                      onChange={e => setFormData(prev => ({ ...prev, priorExperience: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-[#E8E4DB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D4030]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Row 4: Message / Background */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#5A5A40] mb-2">
                Message / Background
              </label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-[#E8E4DB] rounded-xl text-sm focus:outline-none focus:border-[#2D4030] focus:ring-1 focus:ring-[#2D4030] resize-none"
                placeholder="Tell us why you'd be a great partner for Mayflower..."
              />
            </div>

            {/* Row 5: Supporting Documents */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#5A5A40] mb-2">
                Supporting Documents (Optional)
              </label>
              <div className="w-full border-2 border-dashed border-[#E8E4DB] rounded-xl p-6 bg-white text-center hover:bg-stone-50 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-7 h-7 text-[#5A5A40] mx-auto mb-2 group-hover:-translate-y-0.5 transition-transform" />
                <p className="text-sm font-medium text-[#1A1A1A]">Click to upload or drag & drop</p>
                <p className="text-xs text-[#5A5A40] mt-1">PDF, DOC, DOCX, or Images</p>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2 text-left relative z-20">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#2D4030] bg-[#FAF7F2] p-2 rounded-lg border border-[#E8E4DB]">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{f.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-6 border-t border-[#E8E4DB] bg-[#F5F1EB] flex justify-end gap-3 shrink-0 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-[#5A5A40] hover:text-[#1A1A1A] transition-colors rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#2D4030] hover:bg-[#1F3022] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
