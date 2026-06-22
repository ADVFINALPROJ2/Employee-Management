"use client";

import { useEffect, useState } from 'react';
import LeaveAdminTable from '@/components/tables/LeaveAdminTable';
import AuditLogTable from '@/components/tables/AuditLogTable';

export default function AdminLeavePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/leave/admin/manage');
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
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased px-4 py-8 md:px-12 md:py-10">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Approval Portal</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h2 className="text-xl font-bold mb-4">Leave Requests</h2>
              <LeaveAdminTable requests={requests} onRefresh={fetchData} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h2 className="text-xl font-bold mb-4">System Audit Logs</h2>
              <AuditLogTable />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}