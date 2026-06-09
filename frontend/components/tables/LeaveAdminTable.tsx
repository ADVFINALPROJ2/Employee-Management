'use client';

import { useState } from 'react';

interface AdminLeaveRequest {
  leave_id: string;
  employee: { full_name: string }; 
  leave_type: { name: string };
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
}

interface LeaveAdminTableProps {
  requests: AdminLeaveRequest[];
  onRefresh: () => void;
}

export default function LeaveAdminTable({ requests, onRefresh }: LeaveAdminTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<AdminLeaveRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setIsProcessing(true);
    try {
      const response = await fetch(`http://localhost:3001/api/leave/request/${id}/status`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          approverId: "5766c9d0-5950-44bc-9e10-eecc8b10da1f" 
        }),
      });

      if (response.ok) {
        setSelectedRequest(null); // Close the detail panel
        onRefresh(); 
      } else {
        alert('Failed to update status.');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      
      {/* --- Top Filter Bars Matching Mockup --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-1 flex-col md:flex-row gap-4 w-full">
          <input 
            type="text" 
            placeholder="Search employee..." 
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            type="text" 
            placeholder="Find by Department" 
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full md:w-48 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Filter by status</option>
            <option>PENDING</option>
            <option>APPROVED</option>
            <option>REJECTED</option>
          </select>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl text-sm transition tracking-wide w-full md:w-auto shadow-md">
          Add +
        </button>
      </div>

      {/* --- Main Workspace Grid Content Layout --- */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* --- Left Column: Custom Row Cards --- */}
        <div className="flex-1 space-y-4 w-full">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
              No pending leave requests found.
            </div>
          ) : (
            requests.map((req) => (
              <div 
                key={req.leave_id} 
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-center gap-4 min-w-[180px]">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                    {req.employee?.full_name?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">{req.employee?.full_name || 'Unknown'}</h4>
                  </div>
                </div>

                <div className="text-sm font-medium text-gray-700 min-w-[120px]">
                  {req.leave_type?.name || 'Leave Request'}
                </div>

                <div className="text-xs md:text-sm text-gray-500 font-medium min-w-[160px]">
                  {new Date(req.start_date).toLocaleDateString()} — {new Date(req.end_date).toLocaleDateString()}
                </div>

                <div className="text-sm text-gray-500 italic max-w-xs truncate flex-1 px-2">
                  "{req.reason}"
                </div>

                <button
                  onClick={() => setSelectedRequest(req)}
                  className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition-all shadow-sm"
                >
                  Detail
                </button>
              </div>
            ))
          )}
        </div>

        {/* --- Right Column: Mockup Detail Popup Sideboard Module --- */}
        {selectedRequest && (
          <div className="w-full lg:w-[380px] bg-white border border-gray-200 rounded-2xl p-6 shadow-xl sticky top-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Leave Request Details</h3>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Emp Name:</p>
                  <p className="font-semibold text-gray-800">{selectedRequest.employee.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Leave Type:</p>
                  <p className="font-semibold text-gray-800">{selectedRequest.leave_type.name}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Duration Window:</p>
                <p className="font-medium text-gray-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  📅 {new Date(selectedRequest.start_date).toLocaleDateString()} to {new Date(selectedRequest.end_date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Reason Statement:</p>
                <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-amber-900 text-xs italic leading-relaxed">
                  "{selectedRequest.reason}"
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  disabled={isProcessing}
                  onClick={() => handleStatusUpdate(selectedRequest.leave_id, 'APPROVED')}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs transition shadow-md shadow-green-100"
                >
                  {isProcessing ? 'Processing...' : 'Accept'}
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => handleStatusUpdate(selectedRequest.leave_id, 'REJECTED')}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs transition shadow-md shadow-red-100"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}