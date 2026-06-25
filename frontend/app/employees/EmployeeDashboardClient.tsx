// app/employees/EmployeeDashboardClient.tsx
'use strict';
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from "next/navigation";

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

export default function EmployeeDashboardClient({ initialEmployees }: { initialEmployees: Employee[] }) {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(initialEmployees[0] || null);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Local UI-driven filter optimization
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept ? emp.department?.name === selectedDept : true;
      const matchesStatus = selectedStatus ? emp.status === selectedStatus : true;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, selectedDept, selectedStatus]);

  // Unique list of departments extracted dynamically for the filter dropdown
  const departmentsList = useMemo(() => {
    const depts = employees.map((e) => e.department?.name).filter(Boolean);
    return Array.from(new Set(depts));
  }, [employees]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      
      {/* LEFT: Table Container */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Employee Management</h2>
        
        {/* Toolbar Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-lg">🔍</span>
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none text-sm"
          >
            <option value="">Filter by Department</option>
            {departmentsList.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none text-sm"
          >
            <option value="">Filter by Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button 
            onClick={() => router.push("/employees/add")}
            className="w-full bg-[#D1E9FF] hover:bg-blue-200 text-[#0056B3] font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <span>Add Employee</span>
            <span className="text-lg font-bold">+</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 font-medium">
                <th className="py-3 px-4 w-16">ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, index) => (
                <tr key={emp.employee_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-gray-400">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                        {emp.full_name?.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{emp.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{emp.department?.name || 'Unassigned'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1 text-xs border border-blue-200 text-blue-600 rounded hover:bg-blue-50">Edit</button>
                      <button className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">Remove</button>
                      <button 
                        onClick={() => setSelectedEmployee(emp)} 
                        className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: Detail Display Card */}
      <div className="w-full lg:w-[420px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
        {selectedEmployee ? (
          <div>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">Employee Detail</h2>
              <div className="flex flex-col gap-2">
                <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1.5 px-4 rounded transition-colors shadow-sm">
                  Update Info
                </button>
                <button className="bg-red-400 hover:bg-red-500 text-white text-xs font-semibold py-1.5 px-4 rounded transition-colors shadow-sm">
                  Remove Employee
                </button>
              </div>
            </div>

            {/* Profile Avatar Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-2xl font-bold">
                {selectedEmployee.full_name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedEmployee.full_name}</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{selectedEmployee.role || 'Employee'}</p>
              </div>
            </div>

            {/* Info Grid block layout */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Personal Information</h4>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">ID</p>
                  <p className="font-medium text-gray-900 break-all">{selectedEmployee.employee_id.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Hire Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedEmployee.hire_date ? new Date(selectedEmployee.hire_date).toLocaleDateString() : '---'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Email Address</p>
                  <p className="font-medium text-gray-900 break-all">{selectedEmployee.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Phone</p>
                  <p className="font-medium text-gray-900">{selectedEmployee.phone || '-------'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Department</p>
                  <p className="font-medium text-gray-900">{selectedEmployee.department?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Position</p>
                  <p className="font-medium text-gray-900">{selectedEmployee.position || '-------'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Address</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Country</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.address?.country || '-------'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">City/State</p>
                    <p className="font-medium text-gray-900">
                      {selectedEmployee.address?.city || '-------'}
                      {selectedEmployee.address?.state ? `, ${selectedEmployee.address.state}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Select an employee to see detail profiles.
          </div>
        )}
      </div>

    </div>
  );
}