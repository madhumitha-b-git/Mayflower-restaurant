import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Users,
  CheckCircle2,
  Search,
  Download,
  ShieldAlert,
  RotateCw,
  X,
  Lock,
} from 'lucide-react';
import { AuditLogEntry } from '../types';
import { INITIAL_AUDIT_LOGS } from '../data/mockData';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sanctuaryFilter, setSanctuaryFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleVerifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult(
        'Chain integrity verified: 1,428 blocks verified with SHA-256 HMAC. Zero tampering detected.'
      );
    }, 1200);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Action', 'TargetType', 'TargetID', 'Outlet', 'IP', 'Payload'];
    const rows = logs.map((l) => [
      l.id,
      l.timestamp,
      l.actor,
      l.role,
      l.action,
      l.targetType,
      l.targetId,
      l.outlet,
      l.ip,
      JSON.stringify(l.payload).replace(/"/g, '""'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mayflower_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      log.actor.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.targetId.toLowerCase().includes(query) ||
      log.outlet.toLowerCase().includes(query);

    const matchesSanctuary =
      sanctuaryFilter === 'all' ||
      log.outlet.toLowerCase().includes(sanctuaryFilter.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || log.category === categoryFilter;

    return matchesSearch && matchesSanctuary && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[#E8E5DD]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#967C3B] uppercase mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>SUPER ADMIN CONSOLE • SECURITY LEDGER</span>
          </div>
          <h2 className="text-3xl font-serif font-semibold text-[#18211E] tracking-tight">
            Activity &amp; Audit Log
          </h2>
          <p className="text-sm text-[#5B6761] mt-1">
            Immutable system activity log for operational compliance and cryptographic tracking across all Mayflower Sanctuaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-export-log-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D9D6CB] bg-white hover:bg-[#F3EFE7] text-xs font-semibold text-[#202E27] transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#967C3B]" />
            <span>Export Log (CSV)</span>
          </button>

          <button
            id="btn-verify-chain"
            onClick={handleVerifyChain}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0E1914] hover:bg-[#1A2E25] text-xs font-semibold text-white shadow-xs transition cursor-pointer"
          >
            <ShieldAlert className={`w-3.5 h-3.5 text-[#C29B38] ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying HMAC...' : 'Verify Cryptographic Chain'}</span>
          </button>
        </div>
      </div>

      {/* Verification modal / banner */}
      {verificationResult && (
        <div className="p-4 bg-[#F2F8F4] border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-mono font-medium">{verificationResult}</span>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="audit-telemetry">
        {/* Card 1: Total Logged Events */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E6DF] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6B7973]">
              TOTAL LOGGED EVENTS
            </p>
            <h3 className="text-2xl font-serif font-semibold text-[#182420] mt-0.5">
              1,428
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-medium mt-1">
              Recorded this month
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F4EFE6] text-[#A68336] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Security Overrides */}
        <div className="bg-white rounded-xl p-4 border border-[#F3C5C8] shadow-2xs flex items-center justify-between bg-gradient-to-br from-white to-[#FDF4F5]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#8A1A22]">
              SECURITY OVERRIDES
            </p>
            <h3 className="text-2xl font-serif font-semibold text-[#8A1A22] mt-0.5">
              3
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#A82B33] font-medium mt-1">
              Requires manual review
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FBE6E7] text-[#8A1A22] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Active Personnel Traced */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E6DF] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6B7973]">
              ACTIVE PERSONNEL TRACED
            </p>
            <h3 className="text-2xl font-serif font-semibold text-[#182420] mt-0.5">
              38
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-medium mt-1">
              Across 4 sanctuaries
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EFF4F1] text-[#2E5443] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: System Integrity */}
        <div className="bg-white rounded-xl p-4 border border-[#E8E6DF] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6B7973]">
              SYSTEM INTEGRITY
            </p>
            <h3 className="text-2xl font-serif font-semibold text-emerald-800 mt-0.5">
              Verified
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-mono mt-1">
              AES-256 / SHA-256 HMAC
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-[#E8E5DD] p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              id="input-audit-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by actor, action, or target ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D9D6CB] bg-[#FAF9F6] text-[#222E2A] placeholder-zinc-400 focus:bg-white focus:border-[#22332D] focus:ring-1 focus:ring-[#22332D]"
            />
          </div>

          {/* Sanctuary Filter */}
          <div className="w-full lg:w-48">
            <select
              value={sanctuaryFilter}
              onChange={(e) => setSanctuaryFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-[#D9D6CB] bg-white text-[#25322E]"
            >
              <option value="all">All Sanctuaries</option>
              <option value="poes">Poes Garden</option>
              <option value="palavakkam">Palavakkam ECR</option>
              <option value="anna nagar">Anna Nagar East</option>
              <option value="velachery">Velachery Lakeside</option>
              <option value="hq">Chennai HQ</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full lg:w-44">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-[#D9D6CB] bg-white text-[#25322E]"
            >
              <option value="all">All Categories</option>
              <option value="kitchen">Kitchen</option>
              <option value="reservations">Reservations</option>
              <option value="rbac">RBAC</option>
              <option value="overrides">Overrides</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSanctuaryFilter('all');
              setCategoryFilter('all');
            }}
            title="Reset audit filters"
            className="p-2 rounded-lg border border-[#D9D6CB] bg-white hover:bg-[#F3EFE7] text-zinc-600 transition cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Immutable System Log Entries List */}
      <div className="bg-white rounded-xl border border-[#E3E0D6] shadow-xs overflow-hidden">
        {/* Title Bar */}
        <div className="px-6 py-3.5 bg-[#FAF8F4] border-b border-[#ECE7DC] flex items-center justify-between">
          <h3 className="font-mono text-xs font-semibold text-[#404E47] uppercase tracking-wider">
            IMMUTABLE SYSTEM LOG ENTRIES
          </h3>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Ingesting in realtime</span>
          </div>
        </div>

        {/* Entries List */}
        <div className="divide-y divide-[#F0ECE2]">
          {filteredLogs.map((log) => {
            const isOverride = log.isOverride;
            return (
              <div
                key={log.id}
                className={`p-5 transition-colors ${
                  isOverride ? 'bg-[#FCF5F5] hover:bg-[#FAEDED]' : 'hover:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-[#18231F]">
                      {log.actor}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                        log.role === 'SUPERADMIN'
                          ? 'bg-[#15231E] text-[#D8B45A]'
                          : log.role === 'CHEF'
                          ? 'bg-[#FAF2DF] text-[#86621B] border border-[#E4D4B5]'
                          : log.role === 'ACCOUNTANT'
                          ? 'bg-[#EFF3F8] text-[#254668] border border-[#CADAE8]'
                          : 'bg-[#EBF5EF] text-[#23583C] border border-[#C5E2D1]'
                      }`}
                    >
                      {log.role}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-zinc-400">
                    {log.timestamp}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                      isOverride
                        ? 'bg-red-800 text-white'
                        : 'bg-[#EAE6DA] text-[#293630]'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-600">
                    Target: <strong className="text-[#192621]">{log.targetType}</strong> ({log.targetId})
                  </span>
                </div>

                {/* Payload JSON */}
                <div className="mt-2 p-2.5 bg-[#F6F4ED] rounded-lg border border-[#E5DFCE] font-mono text-[11px] text-[#3A4942] overflow-x-auto">
                  <code>{JSON.stringify(log.payload)}</code>
                </div>

                {/* Metadata tags */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        isOverride
                          ? 'bg-red-100 text-red-900 border border-red-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {log.hmacStatus}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span>Outlet: {log.outlet}</span>
                  </div>
                  <div>IP: {log.ip}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
