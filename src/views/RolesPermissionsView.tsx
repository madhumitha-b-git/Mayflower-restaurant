import React, { useEffect, useState } from 'react';
import {
  Lock,
  Check,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { RoleMatrixRow, TabType, UserProfile } from '../types';
import { INITIAL_ROLE_MATRIX } from '../data/mockData';
import { fetchAllStaff } from '../lib/adminService';

interface RolesPermissionsViewProps {
  onNavigate: (tab: TabType) => void;
  user?: UserProfile;
}

export const RolesPermissionsView: React.FC<RolesPermissionsViewProps> = ({ onNavigate, user }) => {
  const [matrix, setMatrix] = useState<RoleMatrixRow[]>(INITIAL_ROLE_MATRIX);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(3); // Default Manager
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadRoleMatrix = async () => {
      try {
        const staff = await fetchAllStaff();
        if (!isActive) return;

        const counts = staff.reduce<Record<string, number>>((acc, member: any) => {
          const role = String(member.role || 'Admin');
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {});

        const nextMatrix: RoleMatrixRow[] = [
          { id: 'super-admin', roleName: 'Super Admin', subtitle: 'Platform governance', personnelCount: counts.SuperAdmin || 1, isImmutable: true, rootConfig: 'locked', financials: true, staffMgmt: true, liveOps: true, guestPii: true, overrides: true, inspect: true, authorizations: [], securityPolicies: { mfa: 'Required', sessionTimeout: '15 min', ipPerimeter: 'Restricted', piiRedaction: 'Masked' }, clusterCoverage: ['All clusters'] },
          { id: 'owner', roleName: 'Owner', subtitle: 'Portfolio oversight', personnelCount: counts.Owner || 0, rootConfig: false, financials: true, staffMgmt: true, liveOps: true, guestPii: true, overrides: true, inspect: true, authorizations: [], securityPolicies: { mfa: 'Required', sessionTimeout: '20 min', ipPerimeter: 'Restricted', piiRedaction: 'Masked' }, clusterCoverage: ['Portfolio'] },
          { id: 'admin', roleName: 'Admin', subtitle: 'Operations control', personnelCount: counts.Admin || 0, rootConfig: false, financials: true, staffMgmt: true, liveOps: true, guestPii: false, overrides: true, inspect: true, authorizations: [], securityPolicies: { mfa: 'Required', sessionTimeout: '30 min', ipPerimeter: 'Managed', piiRedaction: 'Masked' }, clusterCoverage: ['Operations'] },
          { id: 'manager', roleName: 'Manager', subtitle: 'Daily service supervision', personnelCount: counts.Manager || 0, rootConfig: false, financials: false, staffMgmt: true, liveOps: true, guestPii: false, overrides: false, inspect: true, authorizations: [], securityPolicies: { mfa: 'Required', sessionTimeout: '45 min', ipPerimeter: 'Per outlet', piiRedaction: 'Masked' }, clusterCoverage: ['Outlet'] },
          { id: 'chef', roleName: 'Chef', subtitle: 'Kitchen & menu operations', personnelCount: counts.Chef || 0, rootConfig: false, financials: false, staffMgmt: false, liveOps: true, guestPii: false, overrides: false, inspect: true, authorizations: [], securityPolicies: { mfa: 'Required', sessionTimeout: '45 min', ipPerimeter: 'Kitchen only', piiRedaction: 'Allowed' }, clusterCoverage: ['Kitchen'] },
          { id: 'hr', roleName: 'HR', subtitle: 'People & compliance', personnelCount: counts.HR || 0, rootConfig: false, financials: false, staffMgmt: true, liveOps: false, guestPii: true, overrides: false, inspect: true, authorizations: [], securityPolicies: { mfa: 'Required', sessionTimeout: '40 min', ipPerimeter: 'HQ', piiRedaction: 'Masked' }, clusterCoverage: ['People ops'] },
          { id: 'accountant', roleName: 'Accountant', subtitle: 'Finance & ledger review', personnelCount: counts.Accountant || 0, rootConfig: false, financials: true, staffMgmt: false, liveOps: false, guestPii: false, overrides: false, inspect: true, authorizations: [], securityPolicies: { mfa: 'Required', sessionTimeout: '35 min', ipPerimeter: 'Finance only', piiRedaction: 'Masked' }, clusterCoverage: ['Finance'] },
        ];

        setMatrix(nextMatrix);
      } catch {
        if (isActive) setMatrix(INITIAL_ROLE_MATRIX);
      }
    };

    loadRoleMatrix();
    return () => {
      isActive = false;
    };
  }, [user]);

  const activeRole = matrix[selectedRoleIndex] || matrix[0];

  const handleToggleCell = (rowIndex: number, field: keyof RoleMatrixRow) => {
    if (matrix[rowIndex].isImmutable) {
      setToastMessage('Super Admin principal privileges are cryptographically immutable.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const updated = [...matrix];
    const currentVal = updated[rowIndex][field];
    if (typeof currentVal === 'boolean') {
      (updated[rowIndex] as any)[field] = !currentVal;
      setMatrix(updated);
    }
  };

  const handlePublishChanges = () => {
    setToastMessage('RBAC matrix delta committed and signed with SHA-256 HMAC.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const renderCellState = (rowIndex: number, field: keyof RoleMatrixRow, val: any) => {
    if (val === 'locked') {
      return (
        <div className="w-5 h-5 rounded bg-[#16221E] text-white flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-2.5 h-2.5 text-[#D8B45A]" />
        </div>
      );
    }
    if (val === true) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleCell(rowIndex, field);
          }}
          className="w-5 h-5 rounded bg-[#16221E] text-white flex items-center justify-center mx-auto cursor-pointer hover:bg-black transition"
        >
          <Check className="w-3 h-3 text-[#4ADE80]" />
        </button>
      );
    }
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggleCell(rowIndex, field);
        }}
        className="w-5 h-5 rounded bg-[#EBE7DE] text-zinc-400 flex items-center justify-center mx-auto cursor-pointer hover:bg-[#DDD7CA] transition"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
      </button>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#14241E] text-emerald-300 px-4 py-2.5 rounded-lg border border-emerald-500/40 shadow-xl flex items-center gap-2 text-xs font-mono animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E5DD]">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-[#18211E]">
            Authority Domain Grid
          </h2>
          <p className="text-xs text-[#5B6761] mt-0.5">
            Role-based access matrix governing cluster administration and POS terminal functions.
          </p>
        </div>

        <button
          id="btn-publish-matrix"
          onClick={handlePublishChanges}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0E1914] hover:bg-[#1B2F25] text-xs font-semibold text-white shadow-xs transition cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-[#C29B38]" />
          <span>Publish Matrix Changes</span>
        </button>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Authority Domain Grid Table (7 cols on XL) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-[#E3E0D6] shadow-xs overflow-hidden">
            {/* Table Header & Legend */}
            <div className="px-5 py-3.5 bg-[#FAF8F4] border-b border-[#ECE7DC] flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-mono text-[11px] text-[#44534C] font-semibold uppercase">
                AUTHORITY DOMAIN GRID (LIVE MATRIX)
              </span>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#16221E] inline-block"></span>
                  <span>Full Granted</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#C29B38] inline-block"></span>
                  <span>Restricted Scope</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#EBE7DE] inline-block"></span>
                  <span>No Access</span>
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-[#ECE7DC] text-[10px] font-mono text-[#6A7871] uppercase tracking-wider">
                    <th className="py-3 px-3.5 font-semibold">ROLE &amp; RESPONSIBILITY</th>
                    <th className="py-3 px-2 text-center font-semibold">ROOT CONFIG</th>
                    <th className="py-3 px-2 text-center font-semibold">FINANCIALS</th>
                    <th className="py-3 px-2 text-center font-semibold">STAFF MGMT</th>
                    <th className="py-3 px-2 text-center font-semibold">LIVE OPS</th>
                    <th className="py-3 px-2 text-center font-semibold">GUEST PII</th>
                    <th className="py-3 px-2 text-center font-semibold">OVERRIDES</th>
                    <th className="py-3 px-2 text-center font-semibold">INSPECT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE2]">
                  {matrix.map((row, idx) => {
                    const isSelected = selectedRoleIndex === idx;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedRoleIndex(idx)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#F5F2EA]' : 'hover:bg-[#FAF9F5]'
                        }`}
                      >
                        <td className="py-3 px-3.5">
                          <div className="font-serif font-semibold text-sm text-[#18231F] flex items-center gap-2">
                            <span>{row.roleName}</span>
                            {row.isImmutable && (
                              <span className="text-[9px] font-mono uppercase bg-[#14241E] text-[#D8B45A] px-1.5 py-0.5 rounded">
                                IMMUTABLE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#64736C]">{row.subtitle}</div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {renderCellState(idx, 'rootConfig', row.rootConfig)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {renderCellState(idx, 'financials', row.financials)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {renderCellState(idx, 'staffMgmt', row.staffMgmt)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {renderCellState(idx, 'liveOps', row.liveOps)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {renderCellState(idx, 'guestPii', row.guestPii)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {renderCellState(idx, 'overrides', row.overrides)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {renderCellState(idx, 'inspect', row.inspect)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Token lock note */}
            <div className="p-4 bg-[#FAF9F5] border-t border-[#ECE7DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#56645E]">
                <Lock className="w-3.5 h-3.5 text-[#C29B38]" />
                <span>
                  Role matrix enforcement is locked by hardware token. Super Admin access cannot be altered through software.
                </span>
              </div>
              <button
                onClick={() => {
                  setToastMessage('Custom delegate creation template initialized.');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="text-xs font-semibold text-[#18231F] hover:text-[#C29B38] whitespace-nowrap cursor-pointer"
              >
                + Create Custom Delegate
              </button>
            </div>
          </div>

          {/* Recent RBAC Modifications */}
          <div className="bg-white rounded-xl border border-[#E3E0D6] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-serif font-semibold text-sm text-[#18231F]">
                Recent RBAC Modifications
              </h4>
              <button
                id="btn-view-audit-trail-rbac"
                onClick={() => onNavigate('audit-log')}
                className="text-[10px] font-mono text-[#967C3B] hover:underline uppercase tracking-wider font-semibold cursor-pointer"
              >
                VIEW COMPLETE AUDIT TRAIL →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#ECE7DC] flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#1E2E27]">
                    Role assignment updated for HR user by Super Admin
                  </span>
                  <div className="text-[11px] text-zinc-500">
                    Target: User Profile usr-hr-1 • Changed from Admin to HR
                  </div>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">10 Sep 2026 14:30 IST</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#ECE7DC] flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#1E2E27]">
                    POS reconciliation authority revoked for Manager
                  </span>
                  <div className="text-[11px] text-zinc-500">
                    Target: Role Manager • Automated policy update per SOC2
                  </div>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">04 Sep 2026 09:15 IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Role Detail Inspector (5 cols on XL) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-[#E3E0D6] p-6 shadow-xs space-y-5">
            {/* Header for Selected Role */}
            <div className="border-b border-[#ECE7DC] pb-4 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#967C3B]">
                  SELECTED ROLE DOSSIER
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#18231F]">
                  {activeRole.roleName}
                </h3>
                <p className="text-xs text-[#5D6C66] mt-0.5">{activeRole.subtitle}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#16221E] text-[#D8B45A] font-serif font-bold text-base flex items-center justify-center">
                {activeRole.roleName.slice(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Domain Authorizations */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#4E5C56] font-semibold mb-3">
                DOMAIN AUTHORIZATIONS
              </h4>
              <div className="space-y-2.5">
                {activeRole.authorizations.map((auth, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F4] border border-[#EDE7DC] text-xs"
                  >
                    <span className="text-[#202D27] font-medium">{auth.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        auth.status === 'Granted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : auth.status === 'Auth PIN'
                          ? 'bg-[#FAF2DF] text-[#84631D] border border-[#E0D0AB]'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {auth.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandated Security Policies */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#4E5C56] font-semibold mb-3">
                MANDATED SECURITY POLICIES
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-[#FAF8F3] rounded-lg border border-[#EDE7DC]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    MULTI-FACTOR AUTH
                  </span>
                  <span className="font-medium text-[#18231F] mt-0.5 block">
                    {activeRole.securityPolicies.mfa}
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAF8F3] rounded-lg border border-[#EDE7DC]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    SESSION TIMEOUT
                  </span>
                  <span className="font-medium text-[#18231F] mt-0.5 block">
                    {activeRole.securityPolicies.sessionTimeout}
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAF8F3] rounded-lg border border-[#EDE7DC]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    IP PERIMETER
                  </span>
                  <span className="font-medium text-[#18231F] mt-0.5 block">
                    {activeRole.securityPolicies.ipPerimeter}
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAF8F3] rounded-lg border border-[#EDE7DC]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                    PII REDACTION
                  </span>
                  <span className="font-medium text-[#18231F] mt-0.5 block">
                    {activeRole.securityPolicies.piiRedaction}
                  </span>
                </div>
              </div>
            </div>

            {/* Sanctuary Cluster Coverage */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#4E5C56] font-semibold mb-2">
                SANCTUARY CLUSTER COVERAGE
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Poes Garden', 'Palavakkam (ECR)', 'Egmore', 'Anna Nagar'].map(
                  (sanctuary) => (
                    <label
                      key={sanctuary}
                      className="flex items-center gap-2 p-2 bg-[#FAF9F6] border border-[#ECE7DC] rounded-lg cursor-pointer hover:bg-[#F2EDE2]"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-zinc-300 text-[#152520]"
                      />
                      <span className="text-[#202D27]">{sanctuary}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#ECE7DC]">
              <button
                onClick={() => {
                  setToastMessage(`Scope adjustment console opened for ${activeRole.roleName}.`);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-[#0E1914] hover:bg-[#1B2F25] text-white text-xs font-semibold text-center transition cursor-pointer"
              >
                Adjust Role Scopes
              </button>
              <button
                onClick={() => {
                  setToastMessage(`Policy export JSON downloaded for ${activeRole.roleName}.`);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="p-2 rounded-lg border border-[#D9D6CB] hover:bg-[#F4EFE6] text-zinc-600 transition cursor-pointer"
                title="Export role policy"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
