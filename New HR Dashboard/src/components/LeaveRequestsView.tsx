import React, { useState } from 'react';
import { Check, X, Clock, AlertCircle, RefreshCw, Calendar, ArrowRight } from 'lucide-react';
import { LeaveRequest } from '../types';

interface LeaveRequestsViewProps {
  requests: LeaveRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onResetRequests?: () => void;
}

export const LeaveRequestsView: React.FC<LeaveRequestsViewProps> = ({
  requests,
  onApprove,
  onReject,
  onResetRequests,
}) => {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  const filteredRequests = requests.filter((r) => {
    if (filter === 'All') return true;
    return r.status === filter;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  return (
    <div className="space-y-4">
      {/* Header Info Banner */}
      <div className="bg-white/95 rounded-2xl p-5 border border-[#E8E3D8] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-display text-lg sm:text-xl font-semibold text-[#18231E]">
              Shift & Leave Requests Review
            </h2>
            {pendingCount > 0 ? (
              <span className="bg-[#FEF3C7] text-[#B45309] font-bold text-xs px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                {pendingCount} Pending Action
              </span>
            ) : (
              <span className="bg-[#DCFCE7] text-[#15803D] font-bold text-xs px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                All Caught Up
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Review roster changes, shift swaps, and annual/medical leave applications across all salon branches.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E3D8] self-stretch sm:self-auto justify-center">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                filter === status
                  ? 'bg-[#0B2B24] text-white shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#18231E]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full bg-white/90 rounded-2xl p-12 text-center border border-[#E8E3D8]">
            <p className="font-serif-display text-base text-[#18231E]">No requests match the selected filter</p>
            {onResetRequests && (
              <button
                onClick={onResetRequests}
                className="mt-3 text-xs font-semibold text-[#C69C6D] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset demo requests</span>
              </button>
            )}
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'Pending';
            const isApproved = req.status === 'Approved';
            const isRejected = req.status === 'Rejected';

            return (
              <div
                key={req.id}
                id={`request-card-${req.id}`}
                className="bg-white/95 rounded-2xl p-5 border border-[#E8E3D8] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top row: Employee & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs"
                        style={{ backgroundColor: req.avatarBg }}
                      >
                        {req.avatarInitials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-[#18231E] leading-tight">
                          {req.employeeName}
                        </h3>
                        <p className="text-[11px] text-[#7A857F] font-mono">
                          {req.employeeCode} • {req.role}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isPending && (
                        <span className="bg-[#FEF3C7] text-[#B45309] font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-[#FDE68A] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
                          Pending
                        </span>
                      )}
                      {isApproved && (
                        <span className="bg-[#DCFCE7] text-[#15803D] font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                          Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="bg-[#FEE2E2] text-[#B91C1C] font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-[#FECACA]">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Outlet and Request Type Tags */}
                  <div className="flex items-center gap-2 mt-3.5">
                    <span className="bg-[#F3EFE6] text-[#4A453A] font-medium text-xs px-2.5 py-0.5 rounded-md border border-[#E9E4D8]">
                      {req.outlet}
                    </span>
                    <span className="bg-[#F5F2FD] text-[#6D28D9] font-medium text-xs px-2.5 py-0.5 rounded-md border border-[#DDD4F8]">
                      {req.type}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#2E3B35]">
                    <Calendar className="w-3.5 h-3.5 text-[#88948D] shrink-0" />
                    <span className="font-semibold">{req.dates}</span>
                  </div>

                  {/* Reason */}
                  <div className="mt-2.5 bg-[#FAF8F5] rounded-xl p-3 border border-[#EFE9DD] text-xs text-[#4A5550]">
                    <p className="italic leading-relaxed">"{req.reason}"</p>
                  </div>
                </div>

                {/* Footer and Actions */}
                <div className="mt-4 pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
                  <span className="text-[11px] text-[#8C9690] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {req.requestedAt}
                  </span>

                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReject(req.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#B91C1C] bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Reject request"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => onApprove(req.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0B2B24] hover:bg-[#134238] flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                        title="Approve request"
                      >
                        <Check className="w-3.5 h-3.5 text-[#D4A359]" />
                        <span>Approve</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-[#7A857F]">
                      Processed by HR
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
