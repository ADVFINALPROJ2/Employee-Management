"use client";

import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../../services/adminService';

export default function AuditLogTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => getAuditLogs(1, 10),
  });

  if (isLoading) return <div className="p-4 text-sm text-slate-500">Loading audit history...</div>;
  if (error) return <div className="p-4 text-sm text-red-500">Failed to load logs.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(data) && data.length > 0 ? (
            data.map((log: any) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{log.action}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{log.details}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(log.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500 italic">
                No audit logs available yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}