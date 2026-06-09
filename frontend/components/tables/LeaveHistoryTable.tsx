'use client';

interface LeaveRequestItem {
  leave_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

interface LeaveHistoryTableProps {
  requests: LeaveRequestItem[];
}

export default function LeaveHistoryTable({ requests }: LeaveHistoryTableProps) {
  // Small utility formatter to turn database timestamp strings into readable format
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Maps different status inputs cleanly to consistent color layouts
  const getStatusBadge = (status: string) => {
    const norm = status.toUpperCase();
    if (norm === 'APPROVED') return 'bg-green-100 text-green-800 font-semibold border border-green-200';
    if (norm === 'REJECTED') return 'bg-red-100 text-red-800 font-semibold border border-red-200';
    return 'bg-yellow-100 text-yellow-800 font-semibold border border-yellow-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-800">Your Leave Request History</h3>
      </div>
      
      {requests.length === 0 ? (
        <div className="p-6 text-center text-gray-500 font-medium">
          No leave requests found. Submit the form above to log your first one!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-xs uppercase font-bold text-gray-600 tracking-wider">
                <th className="px-6 py-3">Requested Dates</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Submitted On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {requests.map((req) => (
                <tr key={req.leave_id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {formatDate(req.start_date)} — {formatDate(req.end_date)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{req.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                    {formatDate(req.created_at)}
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