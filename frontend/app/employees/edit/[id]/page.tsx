'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { employeeApi } from '@/lib/employee-api';

interface Employee {
  employee_id: string;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  status: 'Active' | 'Inactive';
  department?: {
    department_id: string;
    name: string;
  };
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    position: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  /* ================= LOAD EMPLOYEE ================= */

  useEffect(() => {
    if (!id) return;

    const loadEmployee = async () => {
      try {
        const res = await employeeApi.getOne(id);
        const data = res?.data ?? res;

        setEmployee(data);

        setForm({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          password: '',
          position: data.position || '',
          status: data.status || 'Active',
        });

      } catch (err) {
        console.error("Failed to load employee:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id]);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = { ...form };
    if (!payload.password) delete payload.password;

    try {
      await employeeApi.update(id, payload);
      router.push('/employees');
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update employee");
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-500 font-medium">Loading employee records...</div>;
  if (!employee) return <div className="p-8 text-sm text-red-500 font-medium">Employee not found</div>;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-xl bg-white rounded-sm shadow-sm overflow-hidden border border-gray-100">
        
        {/* Syncs with Dashboard Modal/Card Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Edit Employee Form</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">👤</span>
              <input
                required
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Elias Tadesse"
                className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">✉️</span>
              <input
                required
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@domain.com"
                className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">📞</span>
              <input
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                placeholder="+251-911-111-111"
                className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">🔑</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
                className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Position</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">💼</span>
              <input
                name="position"
                type="text"
                value={form.position}
                onChange={handleChange}
                placeholder="Software Engineer"
                className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">⚡</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 text-gray-800 border border-gray-200 rounded-md text-sm appearance-none focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <span className="absolute right-3 text-gray-400 pointer-events-none text-xs">▼</span>
            </div>
          </div>

          {/* Combined Form Action Bottom Panel */}
          <div className="pt-4 flex justify-end gap-3 items-center border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-4">
            <button
              type="button"
              onClick={() => router.push('/employees')}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#60A5FA] hover:bg-blue-500 text-white font-semibold py-2 px-5 rounded-sm text-sm transition-colors shadow-xs"
            >
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}