'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, Trash2, Edit3, Plus, X, Check } from 'lucide-react';

const API_BASE = 'https://employee-management-6gpn.onrender.com/api';

interface LeaveTypeSummary {
  leave_type_id: string;
  leave_type: string;
  total_days: number;
  total_used: number;
  total_remaining: number;
  employee_count: number;
}

interface LeaveType {
  leave_type_id: string;
  name: string;
}

export default function AdminBalancesPage() {
  const [types, setTypes] = useState<LeaveTypeSummary[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [formLeaveTypeId, setFormLeaveTypeId] = useState('');
  const [formDays, setFormDays] = useState(20);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [b, t] = await Promise.all([
        fetch(`${API_BASE}/leave/admin/balances`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE}/leave/types`, { headers }).then(r => r.ok ? r.json() : []),
      ]);
      const grouped: Record<string, LeaveTypeSummary> = {};
      for (const item of b) {
        const tid = item.leave_type_id;
        const name = item.leave_type?.name ?? item.leave_type ?? tid;
        if (!grouped[tid]) {
          grouped[tid] = {
            leave_type_id: tid,
            leave_type: name,
            total_days: item.total_days ?? 0,
            total_used: item.total_used ?? (item.used_days ?? 0),
            total_remaining: item.total_remaining ?? (item.remaining_days ?? 0),
            employee_count: item.employee_count ?? 1,
          };
        } else {
          grouped[tid].total_used += item.used_days ?? 0;
          grouped[tid].total_remaining += item.remaining_days ?? 0;
          grouped[tid].employee_count += 1;
        }
      }
      setTypes(Object.values(grouped));
      setLeaveTypes(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    await fetch(`${API_BASE}/leave/admin/balances`, {
      method: 'POST', headers, body: JSON.stringify({ leave_type_id: formLeaveTypeId, total_days: formDays }),
    });
    setShowForm(false);
    setFormLeaveTypeId('');
    setFormDays(20);
    fetchData();
  };

  const handleUpdate = async (leaveTypeId: string) => {
    await fetch(`${API_BASE}/leave/admin/balances/${leaveTypeId}`, {
      method: 'PUT', headers, body: JSON.stringify({ total_days: formDays }),
    });
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (leaveTypeId: string) => {
    if (!confirm('Delete all balances for this leave type?')) return;
    await fetch(`${API_BASE}/leave/admin/balances/${leaveTypeId}`, {
      method: 'DELETE', headers,
    });
    fetchData();
  };

  if (loading) return <div className="p-8 text-gray-500 font-medium">Loading...</div>;

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-800">Leave Balances</h1>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Add Leave Type
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex flex-wrap gap-4 items-end">
          <select value={formLeaveTypeId} onChange={e => setFormLeaveTypeId(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-white">
            <option value="">Select type</option>
            {leaveTypes.map(t => <option key={t.leave_type_id} value={t.leave_type_id}>{t.name}</option>)}
          </select>
          <input type="number" value={formDays} onChange={e => setFormDays(Number(e.target.value))}
            className="px-3 py-2 border rounded-md text-sm w-24" min={1} placeholder="Days" />
          <button onClick={handleCreate} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"><Check className="w-4 h-4" /></button>
          <button onClick={() => setShowForm(false)} className="px-3 py-2 border rounded-md text-sm hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
      )}

      {types.length === 0 ? (
        <p className="text-gray-500 italic">No leave balances found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded-lg text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Leave Type</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Default Days</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Employees</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Total Used</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Total Remaining</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.leave_type_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{t.leave_type}</td>
                  {editing === t.leave_type_id ? (
                    <>
                      <td className="px-4 py-3"><input type="number" value={formDays} onChange={e => setFormDays(Number(e.target.value))} className="w-20 px-2 py-1 border rounded text-sm" /></td>
                      <td className="px-4 py-3">{t.employee_count}</td>
                      <td className="px-4 py-3">{t.total_used} days</td>
                      <td className="px-4 py-3">{t.total_remaining} days</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => handleUpdate(t.leave_type_id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditing(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{t.total_days} days</td>
                      <td className="px-4 py-3">{t.employee_count}</td>
                      <td className="px-4 py-3">{t.total_used} days</td>
                      <td className="px-4 py-3 font-medium text-emerald-600">{t.total_remaining} days</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => { setEditing(t.leave_type_id); setFormDays(t.total_days); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(t.leave_type_id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
