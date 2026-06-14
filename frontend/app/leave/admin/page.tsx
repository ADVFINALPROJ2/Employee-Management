'use client';

import { useEffect, useState } from 'react';
import LeaveAdminTable from '@/components/tables/LeaveAdminTable';

export default function AdminLeavePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/leave/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased px-4 py-8 md:px-12 md:py-10">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header Module */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Admin Approval Portal
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Review incoming corporate leave request applications and update data records.
          </p>
        </div>

        {/* Dashboard Frame Content Wrapper */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-xs tracking-wider animate-pulse uppercase">
              Loading Records...
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <LeaveAdminTable requests={requests} onRefresh={fetchRequests} />
          </div>
        )}
        
      </div>
    </div>
  );
}