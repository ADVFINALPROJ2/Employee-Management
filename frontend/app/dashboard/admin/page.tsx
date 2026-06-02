export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">Total Employees</div>
        <div className="bg-white p-6 rounded-lg shadow">Present Today</div>
        <div className="bg-white p-6 rounded-lg shadow">Pending Leaves</div>
        <div className="bg-white p-6 rounded-lg shadow">Open Grievances</div>
      </div>
    </div>
  );
}