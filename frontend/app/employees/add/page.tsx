'use client';

import { useState, useEffect } from "react";
import { employeeApi } from "@/lib/employee-api";
import { useRouter } from "next/navigation";

interface Department {
  department_id: string;
  name: string;
  description: string | null;
}

export default function AddEmployee() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    employeeApi.getDepartments()
      .then(setDepartments)
      .catch(() => {});
  }, []);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    position: "",
    department_id: "",
    hire_date: "",
    role: "Employee", 
    address: {
      country: "",
      city: "",
      state: "",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const submissionData = {
      ...form,
      password: form.password || "TempPassword123!", 
      address: {
        country: form.address.country,
        city: form.address.city.split(",")[0]?.trim() || "",
        state: form.address.city.split(",")[1]?.trim() || "",
      },
    };

    try {
      await employeeApi.create(submissionData);
      router.push("/employees");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to create employee. Ensure unique email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-gray-800 antialiased">
      <div className="w-full mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Add Employee
          </h1>
          <button
            type="button"
            onClick={() => router.push("/employees")}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors border border-gray-300 rounded-md"
          >
            Back
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
            <input
              required
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Elias Tadesse"
              className="w-full px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</label>
            <input
              required
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@domain.com"
              className="w-full px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
            <input
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              placeholder="+251-911-111-111"
              className="w-full px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave blank for default"
              className="w-full px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Position</label>
            <input
              name="position"
              type="text"
              value={form.position}
              onChange={handleChange}
              placeholder="Software Engineer"
              className="w-full px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </div>

          {/* Row: Department + Hire Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Department</label>
              <select
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Hire Date</label>
              <input
                name="hire_date"
                type="date"
                value={form.hire_date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Role</label>
            <div className="flex gap-6 items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                <input
                  type="radio"
                  name="role"
                  value="Admin"
                  checked={form.role === "Admin"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-500 accent-blue-500"
                />
                Admin
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                <input
                  type="radio"
                  name="role"
                  value="Employee"
                  checked={form.role === "Employee"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-500 accent-blue-500"
                />
                Employee
              </label>
            </div>
          </div>

          {/* Address */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-1">Address</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Country</label>
              <input
                name="country"
                type="text"
                value={form.address.country}
                onChange={handleAddressChange}
                placeholder="Ethiopia"
                className="w-full px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">City</label>
              <input
                name="city"
                type="text"
                value={form.address.city}
                onChange={handleAddressChange}
                placeholder="Addis Ababa"
                className="w-full px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">State</label>
              <input
                name="state"
                type="text"
                value={form.address.state}
                onChange={handleAddressChange}
                placeholder="Oromia"
                className="w-full px-3 py-2 bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => router.push("/employees")}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#60A5FA] hover:bg-blue-500 text-white font-semibold py-2 px-5 rounded-sm flex items-center gap-1.5 text-sm transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? "Adding..." : "+ Add Employee"}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}