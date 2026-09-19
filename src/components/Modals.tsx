import React, { useState } from 'react';
import { ActiveModalType } from '../types';
import { OUTLETS, BEVERAGE_ITEMS } from '../data/restaurantData';
import { X, CheckCircle2, Star, Coffee, Send, Sparkles } from 'lucide-react';
import { FranchiseEnquiryForm } from './FranchiseEnquiryForm';

interface ModalsProps {
  activeModal: ActiveModalType;
  onClose: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ activeModal, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState<number>(5);

  if (activeModal === 'none') return null;

  if (activeModal === 'franchise') {
    return <FranchiseEnquiryForm user={null} onClose={onClose} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#FAF7F2] text-[#1A1A1A] w-full max-w-lg rounded-[32px] p-6 sm:p-8 shadow-2xl border border-[#E8E4DB] relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F5F1EB] text-[#1A1A1A] hover:bg-[#E8E4DB] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-10 animate-scaleIn">
            <div className="w-20 h-20 rounded-full bg-[#2D4030]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#2D4030]" />
            </div>
            <h3 className="font-serif text-3xl font-semibold text-[#1A1A1A] mb-3">
              Received With Thanks
            </h3>
            <p className="text-sm text-[#5A5A40] max-w-[280px] mx-auto leading-relaxed">
              Your message has reached our hospitality desk. A member of the Mayflower team will respond shortly.
            </p>
          </div>
        ) : (
          <>

            {/* FEEDBACK MODAL */}
            {activeModal === 'feedback' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold block">
                    Guest Memories
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mt-1">
                    Assistance & Feedback
                  </h3>
                  <p className="text-xs text-[#4A4A4A] mt-1">
                    Your impressions help cultivate perfection in our kitchen, ambiance, and care.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* Interactive Star Rating */}
                  <div>
                    <label className="block uppercase tracking-wider text-[#5A5A40] font-bold mb-2">
                      Your Overall Dining Rating
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= rating
                                ? 'text-amber-500 fill-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-semibold text-[#5A5A40] ml-2">
                        {rating === 5
                          ? 'Exceptional'
                          : rating === 4
                          ? 'Delightful'
                          : rating === 3
                          ? 'Satisfactory'
                          : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block uppercase tracking-wider text-[#5A5A40] font-bold mb-1">
                        Sanctuary Visited *
                      </label>
                      <select className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] focus:outline-none focus:border-[#5A5A40] text-sm text-[#1A1A1A]">
                        {OUTLETS.map((o) => (
                          <option key={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-[#5A5A40] font-bold mb-1">
                        Guest Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] focus:outline-none focus:border-[#5A5A40] text-sm text-[#1A1A1A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-[#5A5A40] font-bold mb-1">
                      Your Experience / Note
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Share details regarding your dishes, seating ambiance, or service..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] focus:outline-none focus:border-[#5A5A40] text-sm text-[#1A1A1A]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#4A4A30] text-white text-[11px] uppercase tracking-widest font-bold transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    <Send className="w-3.5 h-3.5 text-[#E8E4DB]" />
                    <span>Send Dining Feedback</span>
                  </button>
                </form>
              </div>
            )}

            {/* GENERAL CONCIERGE MODAL */}
            {activeModal === 'general' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold block">
                    Mayflower Concierge
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mt-1">
                    General Enquiries & Private Events
                  </h3>
                  <p className="text-xs text-[#4A4A4A] mt-1">
                    Whether you are planning an intimate conservatory buyout or exploring editorial features, our team is at your service.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block uppercase tracking-wider text-[#5A5A40] font-bold mb-1">
                      Inquiry Category
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] focus:outline-none focus:border-[#5A5A40] text-sm text-[#1A1A1A]">
                      <option>Private Dining / Whole Venue Buyout</option>
                      <option>Intimate Wedding / Rehearsal Dinner</option>
                      <option>Corporate Botanical Salon</option>
                      <option>Press, Media & Food Journalism</option>
                      <option>Sommelier Cellar Private Tasting</option>
                      <option>Other Question</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block uppercase tracking-wider text-[#5A5A40] font-bold mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] focus:outline-none focus:border-[#5A5A40] text-sm text-[#1A1A1A]"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-[#5A5A40] font-bold mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98xxx xxxxx"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] focus:outline-none focus:border-[#5A5A40] text-sm text-[#1A1A1A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-[#5A5A40] font-bold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] focus:outline-none focus:border-[#5A5A40] text-sm text-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-[#5A5A40] font-bold mb-1">
                      Message / Request Details
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Proposed date, approximate guest count, or special notes..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] focus:outline-none focus:border-[#5A5A40] text-sm text-[#1A1A1A]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-[11px] uppercase tracking-widest font-bold transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D1CDBC]" />
                    <span>Send Message to Concierge</span>
                  </button>
                </form>
              </div>
            )}

            {/* BEVERAGES & DESSERTS MENU MODAL */}
            {(activeModal === 'cellar' || activeModal === 'drinks') && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-3 border-b border-[#E8E4DB]">
                  <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center shrink-0">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#5A5A40] font-bold block">
                      Beverages & Treats
                    </span>
                    <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                      Drinks & Desserts Menu
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#555555]">
                  Freshly blended monster shakes, iced coolers, specialty coffees, and house-made desserts.
                </p>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  {BEVERAGE_ITEMS.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-2.5">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                          {section.category}
                        </h4>
                      </div>

                      <div className="bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#E8E4DB] space-y-3">
                        {section.items.map((item, iIdx) => (
                          <div 
                            key={iIdx} 
                            className={`flex justify-between items-start ${iIdx > 0 ? 'pt-2.5 border-t border-[#E8E4DB]/70' : ''}`}
                          >
                            <div className="space-y-0.5 pr-3">
                              <p className="font-medium text-xs text-[#1A1A1A]">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-[#666666] leading-snug">
                                {item.desc}
                              </p>
                            </div>
                            <span className="font-bold text-xs text-[#5A5A40] shrink-0">
                              ₹{item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-[11px] uppercase tracking-widest font-bold transition-colors cursor-pointer"
                  >
                    Close Menu
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
