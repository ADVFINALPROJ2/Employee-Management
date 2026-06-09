'use client';

import { useState } from 'react';

interface LeaveRequestFormProps {
  onSuccess: () => void; // Automatically refreshes data grids after successful creation
}

export default function LeaveRequestForm({ onSuccess }: LeaveRequestFormProps) {
  // 1. Form States mapping directly to your NestJS CreateLeaveRequestDto
  const [leaveTypeId, setLeaveTypeId] = useState('a941b50b-2602-45e9-8a41-03ac9f971482'); // Defaulting to your seeded Annual Leave ID
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  // Status UI handling states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Hardcoded employee ID to match your current seeded database profile
    const payload = {
      employeeId: "5766c9d0-5950-44bc-9e10-eecc8b10da1f",
      leaveTypeId,
      startDate,
      endDate,
      reason,
    };

    try {
      const response = await fetch('http://localhost:3001/api/leave/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Captures your backend validation exceptions (e.g., Insufficient balance!)
        throw new Error(data.message || 'Something went wrong processing your request.');
      }

      // Success sequence
      setSuccess(true);
      setStartDate('');
      setEndDate('');
      setReason('');
      onSuccess(); // Trigger parent reload for balances and historical logs
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Submit New Leave Request</h3>
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm font-medium">
          🎉 Leave request submitted successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Leave Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
          <select 
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          >
            <option value="a941b50b-2602-45e9-8a41-03ac9f971482">Annual Leave (Vacation)</option>
            <option value="sick-leave-uuid-placeholder">Sick Leave</option>
            <option value="maternity-leave-uuid-placeholder">Maternity Leave</option>
          </select>
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
        </div>

        {/* Request Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave</label>
          <textarea 
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a brief explanation for your request..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>

        {/* Action Button */}
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Submitting request to database...' : 'Submit Leave Request'}
        </button>
      </form>
    </div>
  );
}