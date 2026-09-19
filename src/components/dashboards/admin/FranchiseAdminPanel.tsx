import { useState } from 'react';
import { Flag, X, Check, FileText, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

const date = (v?: string | null) => v ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(v)) : '—';
const style = (v: unknown) => { const x = String(v).toLowerCase(); return ['new'].includes(x) ? 'bg-gray-100 text-gray-800' : ['under review'].includes(x) ? 'bg-blue-50 text-blue-800' : ['contacted'].includes(x) ? 'bg-amber-50 text-amber-800' : ['qualified'].includes(x) ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'; };
const Badge = ({ value }: { value: string }) => <span className={`ml-auto w-fit rounded-full px-2 py-1 text-[10px] font-bold ${style(value)}`}>{value}</span>;

export const FranchiseAdminPanel = ({ enquiries, onUpdate }: { enquiries: any[], onUpdate: () => void }) => {
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [internalNotes, setInternalNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const filteredEnquiries = enquiries.filter(e => statusFilter === 'all' || e.status?.toLowerCase() === statusFilter.toLowerCase());

  const handleOpen = (e: any) => {
    setSelectedEnquiry(e);
    setInternalNotes(e.internal_notes || '');
  };

  const handleUpdate = async (status: string) => {
    if (!selectedEnquiry) return;
    setUpdating(true);
    try {
      const { FeedbackFranchiseService } = await import('../../../modules/feedback/feedback-franchise.service');
      await FeedbackFranchiseService.updateFranchiseEnquiry(selectedEnquiry.id, selectedEnquiry.status as any, status as any, internalNotes, undefined);
      onUpdate();
      setSelectedEnquiry({ ...selectedEnquiry, status, internal_notes: internalNotes });
    } catch (e: any) {
      alert(e.message || 'Error updating enquiry');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    handleUpdate(selectedEnquiry.status);
  };

  return (
    <section className="rounded-2xl border border-[#e4e2de] bg-white p-6 shadow-sm col-span-1 xl:col-span-2">
      <div className="mb-4 flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="flex gap-2">
          <Flag className="mt-0.5 h-4 w-4 text-[#745b20]" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#745b20]">Franchise management</div>
            <h2 className="font-serif text-xl font-bold text-[#02150c]">Expansion lead inbox</h2>
          </div>
        </div>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[#e4e2de] bg-[#f5f3ef] px-3 py-2 text-xs"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="under review">Under Review</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredEnquiries.map(l => (
          <div key={l.id} onClick={() => handleOpen(l)} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border border-[#e4e2de] bg-[#f5f3ef] px-3 py-2.5 text-xs cursor-pointer hover:border-[#c5a880] transition-colors">
            <div className="min-w-0 space-y-1">
              <b>{l.applicantName ?? l.name ?? l.contact_name ?? 'New lead'}</b>
              <span>{l.cityInterested ?? l.city ?? 'No location supplied'} · {date(l.createdAt || l.created_at)}</span>
            </div>
            <Badge value={l.status ?? 'New'} />
          </div>
        ))}
        {filteredEnquiries.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#e4e2de] p-4 text-center text-xs text-gray-500">
            No franchise enquiries available.
          </div>
        )}
      </div>

      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 rounded-2xl bg-white p-6 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-[#e4e2de] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">{selectedEnquiry.applicantName ?? selectedEnquiry.name}</h2>
                <p className="text-sm text-gray-500">{selectedEnquiry.email} | {selectedEnquiry.phone}</p>
                <p className="text-sm font-medium mt-1">Interested in: {selectedEnquiry.cityInterested}</p>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#745b20] mb-2">Enquiry Details</h3>
                  <div className="bg-[#f5f3ef] p-4 rounded-xl text-sm space-y-2">
                    <p><strong>Investment Budget:</strong> {selectedEnquiry.investmentBudget || selectedEnquiry.investment_budget || 'N/A'}</p>
                    <p><strong>Prior Experience:</strong> {selectedEnquiry.priorExperience || selectedEnquiry.prior_experience ? 'Yes' : 'No'}</p>
                    <p><strong>Submitted:</strong> {new Date(selectedEnquiry.createdAt || selectedEnquiry.created_at).toLocaleString('en-IN')}</p>
                    <div className="pt-2">
                      <strong>Message/Vision:</strong>
                      <p className="mt-1 text-gray-700 whitespace-pre-wrap">{selectedEnquiry.message || 'No message provided.'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#745b20] mb-2">Documents</h3>
                  {selectedEnquiry.documents && selectedEnquiry.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEnquiry.documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between bg-[#f5f3ef] p-3 rounded-xl">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-[#745b20]" />
                            <span className="text-xs truncate">{doc.fileName || doc.file_name}</span>
                          </div>
                          <button 
                            onClick={async () => {
                              const { data } = await supabase.storage.from('franchise-documents').createSignedUrl(doc.storagePath || doc.storage_path, 60);
                              if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                            }}
                            className="p-1.5 hover:bg-white rounded-md text-[#745b20]"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No documents attached.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#745b20] mb-2">Update Status</h3>
                  <select 
                    value={selectedEnquiry.status}
                    onChange={(e) => handleUpdate(e.target.value)}
                    disabled={updating}
                    className="w-full rounded-xl border border-[#e4e2de] bg-white px-3 py-2 text-sm"
                  >
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#745b20] mb-2">Internal Notes (Admin Only)</h3>
                  <textarea 
                    value={internalNotes}
                    onChange={e => setInternalNotes(e.target.value)}
                    className="w-full h-32 rounded-xl border border-[#e4e2de] bg-white p-3 text-sm focus:outline-none focus:border-[#745b20] resize-none"
                    placeholder="Add private notes about this lead..."
                  />
                  <button 
                    onClick={handleSaveNotes}
                    disabled={updating || internalNotes === selectedEnquiry.internalNotes || internalNotes === selectedEnquiry.internal_notes}
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-[#02150c] px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Notes'}
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
