'use client';

import { useState, useEffect } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

interface LeaveRequest {
  leave_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  employee: { full_name: string; email: string };
  leave_type: { name: string };
}

export default function AdminLeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leave/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch {
      console.log('could not load requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (leaveId: string, status: 'Approved' | 'Rejected') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leave/status/${leaveId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchRequests();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update status');
      }
    } catch {
      alert('Could not connect to server');
    }
  };

  if (loading) return <div className="p-8 text-gray-500 font-medium">Loading leave requests...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-6">Leave Requests</h1>

      {requests.length === 0 ? (
        <p className="text-gray-500">No leave requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Employee</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Leave Type</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Start</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">End</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Reason</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.leave_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="font-medium">{req.employee.full_name}</div>
                    <div className="text-xs text-gray-400">{req.employee.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{req.leave_type.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(req.start_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(req.end_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{req.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {req.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(req.leave_id, 'Approved')}
                          className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(req.leave_id, 'Rejected')}
                          className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
