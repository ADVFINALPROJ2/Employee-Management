export default function GrievancePage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit a Grievance</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <input type="text" placeholder="Title" className="w-full border p-2 rounded" />
        <textarea placeholder="Description" className="w-full border p-2 rounded h-32"></textarea>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Submit anonymously
        </label>
        <button className="w-full bg-red-600 text-white py-2 rounded">Submit File</button>
      </div>
    </div>
  );
}