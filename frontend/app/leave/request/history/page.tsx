'use client';
// Admin view for managing leave balance configurations by leave type

import React, { useEffect, useState } from 'react';
import { History, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { leaveApi } from '@/lib/api';

interface LeaveRequest {
  leave_id: string;
  leave_type: { name: string };
  start_date: string;
  end_date: string;
  status: string;
  reason: string;
  created_at: string;
}

export default function LeaveHistoryPage() {
  const [history, setHistory] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaveApi.getHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <History className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">Leave History</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((req, index) => (
              <tr key={req.leave_id || index} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{req.leave_type?.name || 'N/A'}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(req.status)}
                    <span className={`text-sm font-medium ${
                      req.status === 'Approved' ? 'text-emerald-700' : 
                      req.status === 'Rejected' ? 'text-rose-700' : 'text-amber-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {req.reason}
                </td>
              </tr>
            ))}
            {!loading && history.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                  No leave requests found in history.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
