"use client";

import { useState } from "react";
import { employeeApi } from "@/lib/employee-api";
import { useRouter } from "next/navigation";

export default function AddEmployee() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
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

    // Generate a temporary secure password fallback since backend requires password hashing
    const submissionData = {
      ...form,
      password: "TempPassword123!", 
      // Handle the Split UI for City/State input
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
    <div className="min-h-screen bg-gray-900 bg-opacity-40 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">Add Employee Form (Admin Page)</h1>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">👤</span>
              <input
                required
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Elias Tadesse"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">✉️</span>
              <input
                required
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@domain.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">📞</span>
              <input
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                placeholder="+251-911-111-111"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Position</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">💼</span>
              <input
                name="position"
                type="text"
                value={form.position}
                onChange={handleChange}
                placeholder="Software Engineer"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">🌿</span>
              <select
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select Department</option>
                {/* Dynamically replace value strings here with realistic database UUID mappings if required */}
                <option value="d3b07384-d113-4ec2-a5d6-84d2b2fcd601">Engineering</option>
                <option value="d3b07384-d113-4ec2-a5d6-84d2b2fcd602">Sales</option>
                <option value="d3b07384-d113-4ec2-a5d6-84d2b2fcd603">Designer</option>
                <option value="d3b07384-d113-4ec2-a5d6-84d2b2fcd604">HR</option>
              </select>
              <span className="absolute right-3 text-gray-400 pointer-events-none">▼</span>
            </div>
          </div>

          {/* Hire Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Hire Date</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400">📅</span>
              <input
                name="hire_date"
                type="date"
                value={form.hire_date}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Role (Radio controls) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Role</label>
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

          {/* Address Title Section */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-1">Address</h3>
          </div>

          {/* Address Nested Forms Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Country</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400">🌐</span>
                <input
                  name="country"
                  type="text"
                  value={form.address.country}
                  onChange={handleAddressChange}
                  placeholder="Ethiopia"
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">City/State</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400">📍</span>
                <input
                  name="city"
                  type="text"
                  value={form.address.city}
                  onChange={handleAddressChange}
                  placeholder="Addis Ababa, Oromia"
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Action Controls Footer */}
          <div className="pt-4 flex justify-end gap-3 items-center border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-4">
            <button
              type="button"
              onClick={() => router.push("/employees")}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#60A5FA] hover:bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg flex items-center gap-1.5 text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              <span>{loading ? "Adding..." : "+ Add Employee"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}