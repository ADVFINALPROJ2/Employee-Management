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
  const [remarks, setRemarks] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setIsProcessing(true);
    try {
      const response = await fetch(`http://localhost:5000/api/leave/admin/request/${id}/process`, {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks }),
      });

      if (response.ok) {
        setSelectedRequest(null); 
        setRemarks('');
        onRefresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific case where request was already processed
        if (errorData.message === 'This application has already been processed.') {
          alert('This request was already updated by another admin.');
          onRefresh();
          setSelectedRequest(null);
        } else {
          alert(`Failed to update status: ${errorData.message || 'Server error'}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Ensure your backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = (req.employee?.full_name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || 
                          (req.status || '').toUpperCase() === statusFilter.toUpperCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-2 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input 
            type="text" 
            placeholder="Search employee..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full md:w-48 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      <div className="flex-1 space-y-4 w-full">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            No matching leave requests found.
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div 
              key={req.leave_id} 
              className="bg-white border rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border-gray-200"
            >
              <div>
                <h4 className="font-semibold text-gray-900">{req.employee?.full_name}</h4>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                  req.status.toUpperCase() === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                  req.status.toUpperCase() === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {req.status}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedRequest(req)} 
                className="bg-slate-100 px-4 py-1.5 rounded-lg text-xs font-bold"
              >
                Detail
              </button>
            </div>
          ))
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Request Details</h2>
            <p><strong>Employee:</strong> {selectedRequest.employee?.full_name}</p>
            <p><strong>Type:</strong> {selectedRequest.leave_type?.name}</p>
            <p><strong>Dates:</strong> {new Date(selectedRequest.start_date).toLocaleDateString()} - {new Date(selectedRequest.end_date).toLocaleDateString()}</p>
            <p><strong>Reason:</strong> {selectedRequest.reason}</p>
            
            {/* Only show textarea if status is PENDING */}
            {selectedRequest.status.toUpperCase() === 'PENDING' && (
                <textarea
                  placeholder="Add remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border p-2 rounded"
                />
            )}

            <div className="flex gap-2">
              {selectedRequest.status.toUpperCase() === 'PENDING' ? (
                <>
                    <button 
                        onClick={() => handleStatusUpdate(selectedRequest.leave_id, 'APPROVED')}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600 text-white py-2 rounded font-bold"
                    >
                        {isProcessing ? '...' : 'Approve'}
                    </button>
                    <button 
                        onClick={() => handleStatusUpdate(selectedRequest.leave_id, 'REJECTED')}
                        disabled={isProcessing}
                        className="flex-1 bg-red-600 text-white py-2 rounded font-bold"
                    >
                        {isProcessing ? '...' : 'Reject'}
                    </button>
                </>
              ) : (
                <p className="text-center w-full text-gray-500 italic">This request is {selectedRequest.status.toLowerCase()}.</p>
              )}
              <button 
                onClick={() => setSelectedRequest(null)}
                className="flex-1 bg-gray-200 py-2 rounded font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}