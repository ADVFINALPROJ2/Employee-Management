export default function EmployeeAttendancePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <div className="text-4xl font-mono my-4">00:00:00 AM</div>
        <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold">Check-In</button>
      </div>
    </div>
  );
}