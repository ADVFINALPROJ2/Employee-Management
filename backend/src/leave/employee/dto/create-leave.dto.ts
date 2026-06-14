'use client';

import { useState } from 'react';

export default function LeaveRequestPage() {
  // 1. Define all the state variables so the inputs stop being red
  const [leaveTypeId, setLeaveTypeId] = useState('Annual'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState(''); 
  const [loading, setLoading] = useState(false);

  // 2. Define the submit handler function so onSubmit stops being red
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      employeeId: "temp-employee-id", 
      leaveTypeId,                     
      startDate,                       
      endDate,                         
      reason,                          
    };

    try {
      const response = await fetch('http://localhost:7000/api/leave/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('🎉 Leave request submitted successfully!');
        setStartDate('');
        setEndDate('');
        setReason('');
      } else {
        const errorData = await response.json();
        console.error('Validation errors:', errorData);
        alert(`❌ Failed to submit: ${errorData.message || 'Bad Request'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('❌ Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Now the return block safely uses the variables defined above
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Submit Leave Request</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Leave Type</label>
          <select 
            value={leaveTypeId} 
            onChange={(e) => setLeaveTypeId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="Annual">Annual Leave</option>
            <option value="Sick">Sick Leave</option>
            <option value="Unpaid">Unpaid Leave</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border p-2 rounded" 
            required
          />
        </div>

        <div>
          <label className="block mb-1">End Date</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border p-2 rounded" 
            required
          />
        </div>

        <div>
          <label className="block mb-1">Reason for Leave</label>
          <textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a short reason..."
            className="w-full border p-2 rounded" 
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}