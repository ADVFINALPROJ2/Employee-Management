'use client';

import { useState, useEffect } from 'react';

interface LeaveBalance {
  leaveTypeId: string;
  leaveType: string;
  total: number;
  used: number;
  remaining: number;
}

interface LeaveType {
  leave_type_id: string;
  name: string;
}

const API_BASE = 'https://employee-management-6gpn.onrender.com/api';

export default function ApplyLeavePage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [form, setForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLeaveTypes();
    fetchBalances();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leave/types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaveTypes(data);
      }
    } catch {
      console.log('could not load leave types');
    }
  };

  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leave/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBalances(data);
      }
    } catch {
      console.log('could not load balances');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async () => {
    if (!form.leaveTypeId || !form.startDate || !form.endDate || !form.reason) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leaveTypeId: form.leaveTypeId,
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Leave request submitted successfully!' });
        setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
        setFile(null);
        fetchBalances();
      } else {
        setMessage({ type: 'error', text: data.message || 'Something went wrong' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not connect to server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', minHeight: '100vh', padding: '32px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
        Leave Request Form
      </h1>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '32px', maxWidth: '900px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 400, color: '#9ca3af', marginBottom: '24px' }}>
          Submit a New Leave Request
        </h2>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px', whiteSpace: 'nowrap' }}>
                Leave Type
              </label>
              <select
                value={form.leaveTypeId}
                onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
                style={{ width: '100%', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#6b7280' }}
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.leave_type_id} value={lt.leave_type_id}>{lt.name}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px', whiteSpace: 'nowrap' }}>
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                style={{ width: '100%', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#6b7280', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px', whiteSpace: 'nowrap' }}>
                End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                style={{ width: '100%', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#6b7280', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Reason:</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="A detailed explanation of the request"
                style={{ width: '100%', height: '240px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#9ca3af', resize: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ marginTop: '16px' }}>
                {message && (
                  <div style={{
                    fontSize: '12px', marginBottom: '12px', padding: '8px 12px', borderRadius: '6px',
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#16a34a' : '#dc2626'
                  }}>
                    {message.text}
                  </div>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ background: '#60A5FA', color: 'white', border: 'none', borderRadius: '999px', padding: '8px 20px', fontSize: '13px', cursor: 'pointer', opacity: loading ? 0.5 : 1, whiteSpace: 'nowrap' }}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Attachment:</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  height: '240px', border: '2px dashed #d1d5db', borderRadius: '12px',
                  background: dragging ? '#f9fafb' : 'white',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', cursor: 'pointer'
                }}
              >
                {file ? (
                  <p style={{ fontSize: '13px', color: '#6b7280', padding: '0 16px', textAlign: 'center', wordBreak: 'break-all' }}>{file.name}</p>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                      </svg>
                      Drag & Drop File here
                    </div>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Or</span>
                    <label style={{ background: '#3B82F6', color: 'white', borderRadius: '999px', padding: '8px 24px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Upload File
                      <input type="file" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {balances.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Leave Balance</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {balances.map((b) => (
                <div key={b.leaveType} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', background: 'white' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>{b.leaveType}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                    <span>Total: {b.total}</span>
                    <span>Used: {b.used}</span>
                    <span style={{ color: '#3B82F6', fontWeight: 500 }}>Remaining: {b.remaining}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
