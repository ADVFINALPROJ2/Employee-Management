'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Clock, MapPin, Calendar } from 'lucide-react';
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

export default function LeaveStatusPage() {
  const [latest, setLatest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaveApi.getHistory()
      .then(history => {
        if (history && history.length > 0) {
          // Sort by creation date descending to get the latest
          const sorted = [...history].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setLatest(sorted[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="w-8 h-8 text-rose-600" />
        <h1 className="text-2xl font-bold text-gray-800">Current Request Status</h1>
      </div>

      {loading ? (
        <div className="text-gray-500">Checking latest status...</div>
      ) : latest ? (
        <div className="max-w-2xl">
          <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-100/50">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">Latest Submission</p>
                <h2 className="text-3xl font-bold text-gray-900">{latest.leave_type?.name}</h2>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                latest.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                latest.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {latest.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date Range</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {new Date(latest.start_date).toLocaleDateString()} - {new Date(latest.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Submitted On</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {new Date(latest.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase">Reasoning</p>
              <p className="text-gray-600 leading-relaxed italic">"{latest.reason}"</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No active or past leave requests found.</p>
        </div>
      )}
    </div>
  );
}
