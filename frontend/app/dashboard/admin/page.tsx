'use client';

import { useEffect, useState } from 'react';
import { Plus, CalendarCheck, FileEdit, AlertTriangle } from 'lucide-react';
import { apiClient, getUser } from '@/lib/api';

interface AdminDashboardData {
  totalEmployees: number;
  pendingLeaves: number;
  openGrievances: number;
  presentTodayPercentage?: number;
  presentCount?: number;
  newThisMonth?: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const user = getUser();

  useEffect(() => {
    if (user?.role !== 'Admin') {
      window.location.href = '/dashboard/employee';
      return;
    }
    apiClient.get('/dashboard/admin').then(setData).catch(() => {});
  }, []);

  const total = data?.totalEmployees ?? 0;
  const leaves = data?.pendingLeaves ?? 0;
  const grievances = data?.openGrievances ?? 0;
  const presentPct = data?.presentTodayPercentage ?? 0;
  const presentCount = data?.presentCount ?? 0;
  const newCount = data?.newThisMonth ?? 0;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[220px] relative">
          <div className="bg-blue-600 px-5 py-3 flex justify-between items-center text-white font-medium">
            <span>Total Employees</span>
            <button className="bg-white/20 hover:bg-white/30 transition p-1 rounded-md">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 top-12 opacity-5 pointer-events-none from-gray-400 via-transparent to-transparent grid grid-cols-4 p-4 gap-2">
            {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-800 rounded-full h-8 w-8 mx-auto" />)}
          </div>
          <div className="p-6 relative z-10">
            <div className="text-5xl font-bold text-gray-900 tracking-tight">{total.toLocaleString()}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">+{newCount} new this month</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="bg-emerald-600 px-5 py-3 flex justify-between items-center text-white font-medium">
            <span>Present Today</span>
            <CalendarCheck className="w-5 h-5 opacity-90" />
          </div>
          <div className="p-6">
            <div className="text-5xl font-bold text-gray-900 tracking-tight">{presentPct}%</div>
            <div className="text-sm font-medium text-gray-500 mt-1">{presentCount} of {total}</div>
            <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 inline-block px-2 py-0.5 rounded mt-2">On track</div>
          </div>
        </div>

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
            <div className="relative p-2 bg-amber-50 rounded-xl text-amber-500">
              <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
              </svg>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 border-2 border-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="bg-rose-600 px-5 py-3 flex justify-between items-center text-white font-medium">
            <span>Open Grievances</span>
            <AlertTriangle className="w-5 h-5 opacity-90" />
          </div>
          <div className="p-6 flex justify-between items-end">
            <div>
              <div className="text-5xl font-bold text-gray-900 tracking-tight">{grievances}</div>
              <div className="text-sm font-medium text-rose-600 font-semibold mt-1">Requires immediate attention</div>
            </div>
            <div className="relative text-rose-500 bg-rose-50 p-2 rounded-xl">
              <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              </svg>
              <div className="absolute top-[40%] left-[42%] text-white font-bold text-sm">!</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
