export default function LeaveRequestPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit Leave Request</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div><label className="block text-sm font-medium">Leave Type</label></div>
        <div><label className="block text-sm font-medium">Start Date</label></div>
        <div><label className="block text-sm font-medium">End Date</label></div>
        <button className="w-full bg-blue-600 text-white py-2 rounded">Submit Request</button>
      </div>
    </div>
  );
}