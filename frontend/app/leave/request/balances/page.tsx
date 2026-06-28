'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, Trash2, Edit3, Plus, X, Check } from 'lucide-react';

const API_BASE = 'https://employee-management-6gpn.onrender.com/api';

interface LeaveBalance {
  balance_id: string;
  total_days: number;
  used_days: number;
  remaining_days: number;
  employee: { full_name: string; email: string };
  leave_type: { name: string };
}

interface LeaveType {
  leave_type_id: string;
  name: string;
}

export default function AdminBalancesPage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ employee_id: '', leave_type_id: '', total_days: 20, used_days: 0 });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [b, t] = await Promise.all([
        fetch(`${API_BASE}/leave/admin/balances`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE}/leave/types`, { headers }).then(r => r.ok ? r.json() : []),
      ]);
      setBalances(b);
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
      method: 'POST', headers, body: JSON.stringify({ leave_type_id: form.leave_type_id, total_days: form.total_days }),
    });
    setShowForm(false);
    setForm({ employee_id: '', leave_type_id: '', total_days: 20, used_days: 0 });
    fetchData();
  };

  const handleUpdate = async (id: string) => {
    await fetch(`${API_BASE}/leave/admin/balances/${id}`, {
      method: 'PUT', headers, body: JSON.stringify({ total_days: form.total_days, used_days: form.used_days }),
    });
    setEditing(null);
    setForm({ employee_id: '', leave_type_id: '', total_days: 20, used_days: 0 });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this balance?')) return;
    await fetch(`${API_BASE}/leave/admin/balances/${id}`, {
      method: 'DELETE', headers,
    });
    fetchData();
  };

  const startEdit = (b: LeaveBalance) => {
    setEditing(b.balance_id);
    setForm({ employee_id: '', leave_type_id: '', total_days: b.total_days, used_days: b.used_days });
  };

  if (loading) return <div className="p-8 text-gray-500 font-medium">Loading...</div>;

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-800">Leave Balances</h1>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ employee_id: '', leave_type_id: '', total_days: 20, used_days: 0 }); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Add for All Employees
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Leave Type</label>
            <select value={form.leave_type_id} onChange={e => setForm({ ...form, leave_type_id: e.target.value })}
              className="px-3 py-2 border rounded-md text-sm bg-white">
              <option value="">Select type</option>
              {leaveTypes.map(t => <option key={t.leave_type_id} value={t.leave_type_id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Total Days</label>
            <input type="number" value={form.total_days} onChange={e => setForm({ ...form, total_days: Number(e.target.value) })}
              className="px-3 py-2 border rounded-md text-sm w-24" min={1} />
          </div>
          <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {balances.length === 0 ? (
        <p className="text-gray-500 italic">No leave balances found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded-lg text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Employee</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Leave Type</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Used</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Remaining</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b.balance_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.employee.full_name}</div>
                    <div className="text-xs text-gray-400">{b.employee.email}</div>
                  </td>
                  <td className="px-4 py-3">{b.leave_type.name}</td>
                  {editing === b.balance_id ? (
                    <>
                      <td className="px-4 py-3"><input type="number" value={form.total_days} onChange={e => setForm({ ...form, total_days: Number(e.target.value) })} className="w-20 px-2 py-1 border rounded text-sm" /></td>
                      <td className="px-4 py-3"><input type="number" value={form.used_days} onChange={e => setForm({ ...form, used_days: Number(e.target.value) })} className="w-20 px-2 py-1 border rounded text-sm" /></td>
                      <td className="px-4 py-3 font-medium">{form.total_days - form.used_days} days</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => handleUpdate(b.balance_id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                        <button onClick={() => { setEditing(null); setForm({ employee_id: '', leave_type_id: '', total_days: 20, used_days: 0 }); }} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{b.total_days} days</td>
                      <td className="px-4 py-3">{b.used_days} days</td>
                      <td className="px-4 py-3 font-medium text-emerald-600">{b.remaining_days} days</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => startEdit(b)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(b.balance_id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
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
