'use client';
import { useState, useEffect } from 'react';

export default function LeaveTypeManagement() {
  const [types, setTypes] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxDays, setMaxDays] = useState('');

  const fetchTypes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leave/admin/types');
      const data = await res.json();
      setTypes(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Fetch error:', err); }
  };

  useEffect(() => { fetchTypes(); }, []);

  // UPDATED: Added error handling to Delete
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this leave type?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/leave/admin/types/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        fetchTypes();
      } catch (err) {
        alert('Could not delete the leave type. Please check your connection.');
      }
    }
  };

  // UPDATED: Added error handling to Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/leave/admin/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, max_days: parseInt(maxDays) }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create');
      }
      
      setName(''); setDescription(''); setMaxDays('');
      fetchTypes();
    } catch (err) {
      alert('Failed to add leave type: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Leave Types</h1>
      
      <form onSubmit={handleCreate} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <input 
          placeholder="Name" value={name} onChange={e => setName(e.target.value)}
          className="border p-2 mr-2" required
        />
        <input 
          placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}
          className="border p-2 mr-2"
        />
        <input 
          type="number" placeholder="Max Days" value={maxDays} 
          onChange={e => setMaxDays(e.target.value)}
          className="border p-2 mr-2" required
        />
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded">Add Type</button>
      </form>

      <table className="w-full border-collapse">
        <thead>
            <tr className="bg-gray-100 text-left">
                <th className="p-3 border">Type</th>
                <th className="p-3 border">Max Days</th>
                <th className="p-3 border">Actions</th>
            </tr>
        </thead>
        <tbody>
          {/* SAFETY CHECK: Always ensure types is an array before mapping */}
          {Array.isArray(types) && types.map(t => (
            <tr key={t.leave_type_id} className="border-b">
              <td className="p-3">{t.name}</td>
              <td className="p-3">{t.max_days}</td>
              <td className="p-3">
                <button onClick={() => handleDelete(t.leave_type_id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}