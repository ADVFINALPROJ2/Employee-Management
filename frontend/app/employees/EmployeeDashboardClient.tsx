'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { employeeApi } from "@/lib/employee-api";

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
}

export default function EmployeeDashboardClient({
  initialEmployees,
}: {
  initialEmployees: Employee[];
}) {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees || []);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // ✅ Fix: auto select first employee safely
  useEffect(() => {
    if (employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0]);
    }
  }, [employees]);

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

  // ✅ FIXED REMOVE
  const handleRemove = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this employee?");
    if (!ok) return;

    try {
      await employeeApi.remove(id);

      setEmployees((prev) => {
        const updated = prev.filter((e) => e.employee_id !== id);

        // ✅ Fix selected employee after delete
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">

      {/* LEFT PANEL */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        <h2 className="text-xl font-bold mb-6 text-gray-800">
          Employee Management
        </h2>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Employees..."
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Department</option>
            {departmentsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={() => router.push("/employees/add")}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold text-sm"
          >
            Add Employee +
          </button>
        </div>

        {/* TABLE */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2">#</th>
              <th>Name</th>
              <th>Department</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, index) => (
                <tr
                  key={emp.employee_id}
                  className={`border-b hover:bg-gray-50 ${
                    selectedEmployee?.employee_id === emp.employee_id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <td className="py-2">
                    {String(index + 1).padStart(2, '0')}
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                        {emp.full_name?.charAt(0) || "?"}
                      </div>
                      {emp.full_name}
                    </div>
                  </td>

                  <td>{emp.department?.name || "Unassigned"}</td>

                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      emp.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {emp.status}
                    </span>
                  </td>

                  <td className="text-right space-x-2">
                    <button
                      onClick={() => handleEdit(emp.employee_id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleRemove(emp.employee_id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Remove
                    </button>

                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="text-gray-600 hover:underline text-sm"
                    >
                      View
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[420px] bg-white p-6 rounded-xl border">

        {selectedEmployee ? (
          <>
            <div className="flex justify-between items-start">

              <h2 className="font-bold text-lg">
                Employee Detail
              </h2>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(selectedEmployee.employee_id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                >
                  Update
                </button>

                <button
                  onClick={() => handleRemove(selectedEmployee.employee_id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-1 text-sm">
              <p><b>Name:</b> {selectedEmployee.full_name}</p>
              <p><b>Email:</b> {selectedEmployee.email}</p>
              <p><b>Department:</b> {selectedEmployee.department?.name || "N/A"}</p>
              <p><b>Status:</b> {selectedEmployee.status}</p>
            </div>
          </>
        ) : (
          <p className="text-gray-400">No employee selected</p>
        )}

      </div>
    </div>
  );
}