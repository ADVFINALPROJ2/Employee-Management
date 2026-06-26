'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { employeeApi } from "@/lib/employee-api";

/* ================= TYPES ================= */

interface Employee {
  employee_id: string;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  status: 'Active' | 'Inactive';
  hire_date?: string;
  role?: string;
  department?: {
    department_id: string;
    name: string;
  };
  address?: {
    country?: string;
    city?: string;
    state?: string;
  };
}

interface Props {
  initialEmployees: Employee[];
}

/* ================= COMPONENT ================= */

export default function EmployeeDashboardClient({ initialEmployees }: Props) {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees || []);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  /* ================= INIT ================= */

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0]);
    }
  }, [employees, selectedEmployee]);

  /* ================= FILTER ================= */

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const search = searchTerm.toLowerCase();

      return (
        (emp.full_name?.toLowerCase().includes(search) ||
          emp.email?.toLowerCase().includes(search) ||
          emp.position?.toLowerCase().includes(search)) &&
        (selectedDept ? emp.department?.name === selectedDept : true) &&
        (selectedStatus ? emp.status === selectedStatus : true)
      );
    });
  }, [employees, searchTerm, selectedDept, selectedStatus]);

  const departmentsList = useMemo(() => {
    return Array.from(
      new Set(
        employees
          .map((e) => e.department?.name)
          .filter((d): d is string => Boolean(d))
      )
    );
  }, [employees]);

  /* ================= ACTIONS ================= */

  const handleRemove = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this employee?");
    if (!ok) return;

    try {
      await employeeApi.remove(id);

      setEmployees((prev) => {
        const updated = prev.filter((e) => e.employee_id !== id);

        if (selectedEmployee?.employee_id === id) {
          setSelectedEmployee(updated[0] || null);
        }

        return updated;
      });

    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete employee");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/employees/edit/${id}`);
  };

  /* ================= UI ================= */

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">

      {/* LEFT PANEL: TABLE MANAGEMENT */}
      <div className="flex-1 bg-white rounded-sm shadow-xs border border-gray-100 p-6 w-full">

        <h2 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">
          Employee Management
        </h2>

        {/* FILTERS TOOLBAR */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full items-center justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3 w-full">
            
            {/* Search Input */}
            <div className="relative flex items-center flex-1 min-w-[200px]">
              <span className="absolute left-3 text-gray-400 text-lg">🔍</span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Employees.."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Department Dropdown */}
            <div className="relative min-w-[160px]">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-500 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Filter by Department</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
            </div>

            {/* Status Dropdown */}
            <div className="relative min-w-[140px]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-500 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">Filter by Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
            </div>
          </div>

          {/* Add Employee Action Button */}
          <button
            onClick={() => router.push("/employees/add")}
            className="w-full sm:w-auto px-4 py-2 bg-[#E0F2FE] hover:bg-blue-200 text-[#0284C7] rounded-md font-medium text-sm flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <span>Add Employee</span>
            <span className="text-base font-semibold">+</span>
          </button>
        </div>

        {/* EMPLOYEES DATATABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-medium">
                <th className="pb-3 font-medium pl-2 w-12">ID</th>
                <th className="pb-3 font-medium px-4">Name</th>
                <th className="pb-3 font-medium px-4">Department</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium text-right pr-2">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const isSelected = selectedEmployee?.employee_id === emp.employee_id;
                  return (
                    <tr
                      key={emp.employee_id}
                      className={`group transition-colors align-middle ${
                        isSelected ? "bg-gray-50/60" : "hover:bg-gray-50/40"
                      }`}
                    >
                      <td className="py-3 pl-2 font-normal text-gray-500 w-12">
                        {String(index + 1).padStart(2, '0')}
                      </td>

                      <td className="py-3 px-4 font-normal text-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#E9D5FF] text-[#6B21A8] rounded-full flex items-center justify-center font-medium overflow-hidden">
                            <span className="text-xs">👤</span>
                          </div>
                          <span className="font-medium text-gray-700">{emp.full_name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-500 font-normal">
                        {emp.department?.name || "Unassigned"}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-sm text-xs font-normal tracking-wide inline-block ${
                          emp.status === "Active"
                            ? "bg-[#DCFCE7] text-[#166534]"
                            : "bg-[#E5E7EB] text-[#374151]"
                        }`}>
                          {emp.status}
                        </span>
                      </td>

                      <td className="py-3 pr-2 text-right whitespace-nowrap">
                        <div className="inline-flex gap-1.5">
                          {/* Edit Row Action */}
                          <button
                            onClick={() => handleEdit(emp.employee_id)}
                            className="px-2.5 py-1 text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-sm text-xs font-normal hover:bg-blue-100 flex items-center gap-1 transition-all"
                          >
                            <span>📝</span> Edit
                          </button>

                          {/* Delete Row Action */}
                          <button
                            onClick={() => handleRemove(emp.employee_id)}
                            className="px-2.5 py-1 text-[#DC2626] bg-[#FEF2F2] border border-[#FEE2E2] rounded-sm text-xs font-normal hover:bg-red-100 flex items-center gap-1 transition-all"
                          >
                            <span>🗑️</span> Remove
                          </button>

                          {/* View Select Action */}
                          <button
                            onClick={() => setSelectedEmployee(emp)}
                            className="px-3 py-1 text-gray-600 bg-gray-100 rounded-sm text-xs font-normal hover:bg-gray-200 transition-all"
                          >
                            View
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT PANEL: SELECTED PROFILE CARD PREVIEW */}
      <div className="w-full lg:w-[400px] bg-white p-6 rounded-sm border border-gray-100 shadow-xs shrink-0">
        {selectedEmployee ? (
          <div className="flex flex-col">
            
            {/* Header Area With Action Controls */}
            <div className="flex justify-between items-start gap-4">
              <h2 className="font-bold text-xl text-gray-900 tracking-tight">
                Employee Detail
              </h2>

              <div className="flex flex-col gap-1.5 w-28 shrink-0">
                <button
                  onClick={() => handleEdit(selectedEmployee.employee_id)}
                  className="w-full bg-[#60A5FA] hover:bg-blue-500 text-white text-xs font-semibold py-1.5 px-3 rounded-sm tracking-wide shadow-xs transition-colors"
                >
                  Update Info
                </button>

                <button
                  onClick={() => handleRemove(selectedEmployee.employee_id)}
                  className="w-full bg-[#FF8B8B] hover:bg-red-500 text-white text-xs font-semibold py-1.5 px-3 rounded-sm tracking-wide shadow-xs transition-colors"
                >
                  Remove Employee
                </button>
              </div>
            </div>

            {/* Profile Large Badge Header */}
            <div className="flex items-center gap-4 mt-4 mb-6">
              <div className="w-20 h-20 bg-[#F3E8FF] text-[#7C3AED] rounded-full flex items-center justify-center font-bold text-3xl">
                <span>👤</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 leading-tight">
                  {selectedEmployee.full_name}
                </h3>
                <p className="text-gray-400 text-xs font-medium mt-0.5">
                  Employee
                </p>
              </div>
            </div>

            {/* Grid Attributes Segment */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Personal Information</h4>
                
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">ID</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedEmployee.employee_id ? `Emp-${selectedEmployee.employee_id.slice(0,4)}` : 'Emp-0240'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">First Name</span>
                      <span className="text-sm font-semibold text-gray-800">{selectedEmployee.full_name?.split(" ")[0] || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">Last Name</span>
                      <span className="text-sm font-semibold text-gray-800">{selectedEmployee.full_name?.split(" ").slice(1).join(" ") || "—"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">Email Address</span>
                      <span className="text-sm font-semibold text-gray-800 break-all">{selectedEmployee.email}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">Phone</span>
                      <span className="text-sm font-semibold text-gray-800">{selectedEmployee.phone || "—"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">Department</span>
                      <span className="text-sm font-semibold text-gray-800">{selectedEmployee.department?.name || "Unassigned"}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">Position</span>
                      <span className="text-sm font-semibold text-gray-800">{selectedEmployee.position || "—"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">Hire Date</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedEmployee.hire_date || "04-06-2026"}</span>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Address</h4>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">Country</span>
                      <span className="text-sm font-semibold text-gray-800">{selectedEmployee.address?.country || "Ethiopia"}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">City/State</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {selectedEmployee.address?.city}
                        {selectedEmployee.address?.state ? `, ${selectedEmployee.address.state}` : ''}
                        {!selectedEmployee.address?.city && !selectedEmployee.address?.state && "Addis Ababa"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">Sub City</span>
                      <span className="text-sm font-semibold text-gray-800">Yeka</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-tight">House Number</span>
                      <span className="text-sm font-semibold text-gray-800">-------</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">
            Select an employee from the left panel to inspect profile files.
          </div>
        )}

      </div>
    </div>
  );
}