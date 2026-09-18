import React, { useState } from 'react';
import { Clock, AlertCircle, LogIn, LogOut, UserPlus } from 'lucide-react';
import { ActivityLog } from './types';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  onClearLogs?: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs }) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  const getActionIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'clock-in':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF7ED] text-[#16803D] flex items-center justify-center border border-[#C6EAD1]">
            <LogIn className="w-4 h-4" />
          </div>
        );
      case 'clock-out':
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 text-[#4B5563] flex items-center justify-center border border-gray-200">
            <LogOut className="w-4 h-4" />
          </div>
        );
      case 'leave':
        return (
          <div className="w-8 h-8 rounded-full bg-[#F5F2FD] text-[#6D28D9] flex items-center justify-center border border-[#DDD4F8]">
            <AlertCircle className="w-4 h-4" />
          </div>
        );
      case 'onboard':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FEF8EC] text-[#D4A359] flex items-center justify-center border border-[#F6E0B8]">
            <UserPlus className="w-4 h-4 text-[#B45309]" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white/95 rounded-2xl p-5 border border-[#E8E3D8] shadow-sm space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F2ECE1] pb-4">
        <div>
          <h2 className="font-serif-display text-lg sm:text-xl font-semibold text-[#18231E]">
            Real-Time Staff Activity & Timecard Log
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Automated punch-ins, biometric attendance sync, and operational roster changes.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E3D8] text-xs">
          {[
            { id: 'all', label: 'All Logs' },
            { id: 'clock-in', label: 'Clock-In' },
            { id: 'clock-out', label: 'Clock-Out' },
            { id: 'leave', label: 'Leaves' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                filterType === item.id
                  ? 'bg-[#0B2B24] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#18231E]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3 pt-1">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-[#707B75]">
            <p className="font-serif-display text-base">No activity logged for this filter</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE6] border border-[#EFE9DD] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                {getActionIcon(log.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#18231E]">
                      {log.employeeName}
                    </span>
                    <span className="bg-[#EAE5DA] text-[#4A5550] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                      {log.outlet}
                    </span>
                  </div>
                  <p className="text-xs text-[#596560] mt-0.5">{log.details}</p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-4">
                <span className="font-mono text-xs font-semibold text-[#18231E] block">
                  {log.timestamp}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C9690]">
                  Today
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
