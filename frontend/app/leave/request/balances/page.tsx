'use client';

import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { leaveApi } from '@/lib/api';

interface LeaveBalance {
  leaveType: string;
  total: number;
  used: number;
  remaining: number;
}

export default function LeaveBalancesPage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaveApi.getBalance()
      .then(setBalances)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Wallet className="w-8 h-8 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Leave Balances</h1>
      </div>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {balances.map((b) => (
            <div key={b.leaveType} className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">{b.leaveType}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Entitlement</span>
                  <span className="font-medium text-gray-900">{b.total} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Used</span>
                  <span className="font-medium text-rose-600">{b.used} days</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Remaining</span>
                  <span className="text-xl font-bold text-emerald-600">{b.remaining} days</span>
                </div>
              </div>
            </div>
          ))}
          {balances.length === 0 && (
            <p className="text-gray-500 italic col-span-full">No leave balances found.</p>
          )}
        </div>
      )}
    </div>
  );
}
