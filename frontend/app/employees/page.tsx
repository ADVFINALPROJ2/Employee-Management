export default function EmployeeListPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee List</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Employee</button>
      </div>
      <div className="mt-6 bg-white rounded-lg shadow p-4 text-gray-400 border-2 border-dashed">
        [Table Implementation: ID, Name, Department, Status, Search, Filters]
      </div>
    </div>
  );
}