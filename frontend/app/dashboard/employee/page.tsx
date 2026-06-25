'use client';

import { useEffect, useState } from 'react';
import { User, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient, getUser } from '@/lib/api';

interface LeaveBalanceItem {
  leave_type: { name: string };
  remaining_days: number;
}

interface EmployeeDashboardData {
  pendingLeaves: number;
  approvedLeaves: number;
  openGrievances: number;
  leaveBalance: LeaveBalanceItem[];
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const user = getUser();

  useEffect(() => {
    if (user?.role === 'Admin') {
      window.location.href = '/dashboard/admin';
      return;
    }
    const employeeId = user?.id;
    if (employeeId) {
      apiClient.get(`/dashboard/employee?employeeId=${employeeId}`).then(setData).catch(() => {});
    }
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Employee Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[250px]">
          <div className="bg-blue-600 px-5 py-3 text-white font-medium flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>My Profile</span>
          </div>
          <div className="p-6 flex-grow flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl border border-blue-100">
              {user?.fullName ? user.fullName.charAt(0) : 'E'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.fullName ?? 'Employee Name'}</h2>
              <p className="text-sm text-gray-500 font-medium">{user?.role ?? 'Department Team Member'}</p>
              <p className="text-xs text-gray-400 mt-1">{user?.email ?? 'employee@company.com'}</p>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-amber-500 flex items-center justify-center gap-1">
                <Calendar className="w-4 h-4" /> {data?.pendingLeaves ?? 0}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Pending</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-600 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {data?.approvedLeaves ?? 0}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Approved</div>
            </div>
            <div>
              <div className="text-lg font-bold text-rose-500 flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" /> {data?.openGrievances ?? 0}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Grievances</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[250px]">
          <div className="bg-emerald-600 px-5 py-3 text-white font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Time Off Allocations & Balances</span>
            </div>
          </div>
          <div className="p-6 flex-grow">
            {data?.leaveBalance && data.leaveBalance.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.leaveBalance.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">{item.leave_type.name}</div>
                      <div className="text-xs text-gray-400 font-medium mt-0.5">Available Limit</div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">{item.remaining_days}</span>
                      <span className="text-xs text-gray-500 font-medium ml-1">Days</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-6">
                <Calendar className="w-12 h-12 stroke-1 mb-2 opacity-60" />
                <p className="text-sm font-medium">No active leave track balances found.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
