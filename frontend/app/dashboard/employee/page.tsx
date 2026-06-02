export default function EmployeeDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800">Employee Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">Employee Info Profile</div>
        <div className="bg-white p-6 rounded-lg shadow">Leave Balance Component</div>
      </div>
    </div>
  );
}