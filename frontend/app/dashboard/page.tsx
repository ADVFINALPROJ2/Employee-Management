'use client';

import React, { useEffect, useState } from 'react';
import { Plus, CalendarCheck, FileEdit, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api'; 

interface AdminDashboardData {
  totalEmployees: number;
  pendingLeaves: number;
  openGrievances: number;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true);
        const response = await apiClient.get('/dashboard/admin');
        setData(response);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  if (loading) return <div className="p-8 text-gray-500 font-medium">Loading analytics...</div>;
  if (error) return <div className="p-8 text-rose-600 font-medium">Error: {error}</div>;

  const total = data?.totalEmployees ?? 0;
  const leaves = data?.pendingLeaves ?? 0;
  const grievances = data?.openGrievances ?? 0;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* Total Employees Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="bg-blue-600 px-5 py-3 flex justify-between items-center text-white font-medium">
            <span>Total Employees</span>
            <button className="bg-white/20 hover:bg-white/30 transition p-1 rounded-md">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="text-5xl font-bold text-gray-900 tracking-tight">{total.toLocaleString()}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Active Personnel</div>
          </div>
        </div>

        {/* Present Today Card (Static/Calculated Placeholder) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="bg-emerald-600 px-5 py-3 flex justify-between items-center text-white font-medium">
            <span>Present Today</span>
            <CalendarCheck className="w-5 h-5 opacity-90" />
          </div>
          <div className="p-6">
            <div className="text-5xl font-bold text-gray-900 tracking-tight">--</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Attendance sync pending</div>
          </div>
        </div>

        {/* Pending Leave Requests Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="bg-amber-500 px-5 py-3 flex justify-between items-center text-white font-medium">
            <span>Pending Leave Requests</span>
            <FileEdit className="w-5 h-5 opacity-90" />
          </div>
          <div className="p-6 flex justify-between items-end">
            <div>
              <div className="text-5xl font-bold text-gray-900 tracking-tight">{leaves}</div>
              <div className="text-sm font-medium text-gray-500 mt-1">Awaiting approval</div>
            </div>
            <div className="text-amber-500 bg-amber-50 p-2 rounded-xl">
              <FileEdit className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Open Grievances Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="bg-rose-600 px-5 py-3 flex justify-between items-center text-white font-medium">
            <span>Open Grievances</span>
            <AlertTriangle className="w-5 h-5 opacity-90" />
          </div>
          <div className="p-6 flex justify-between items-end">
            <div>
              <div className="text-5xl font-bold text-gray-900 tracking-tight">{grievances}</div>
              <div className="text-sm font-medium text-rose-600 font-semibold mt-1">Requires attention</div>
            </div>
            <div className="text-rose-500 bg-rose-50 p-2 rounded-xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}