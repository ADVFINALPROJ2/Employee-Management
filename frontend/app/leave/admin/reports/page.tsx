'use client';
import { useState, useEffect } from 'react';

export default function LeaveReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [leaveTypeId, setLeaveTypeId] = useState('');

  const fetchReport = async () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (leaveTypeId) params.append('leaveTypeId', leaveTypeId);

    const res = await fetch(`http://localhost:5000/api/leave/admin/reports?${params.toString()}`);
    const json = await res.json();
    setData(Array.isArray(json) ? json : []);
  };

  useEffect(() => { fetchReport(); }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* CHANGE 1: Added a container for the title and button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave Reports</h1>
        <button 
          onClick={() => window.print()} 
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Print Report
        </button>
      </div>

      {/* Filter Section */}

      <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded no-print">
        <input type="date" onChange={(e) => setStartDate(e.target.value)} className="border p-2" />
        <button onClick={fetchReport} className="bg-blue-600 text-white px-4 py-2 rounded">
          Apply Filters
        </button>
      </div>

      {/* Table Section */}
      <div id="report-table">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Employee</th>
              <th className="p-3 border">Leave Type</th>
              <th className="p-3 border">Start Date</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((req) => (
              <tr key={req.leave_id} className="border-b">
                <td className="p-3">{req.employee?.full_name}</td>
                <td className="p-3">{req.leave_type?.name}</td>
                <td className="p-3">{new Date(req.start_date).toLocaleDateString()}</td>
                <td className="p-3">{req.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  }