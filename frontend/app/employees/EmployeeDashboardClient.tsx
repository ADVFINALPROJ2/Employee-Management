'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { employeeApi } from "@/lib/employee-api";
import { getUser } from "@/lib/api";
import { toast } from "@/lib/toast";

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

export default function EmployeeDashboardClient({
  initialEmployees,
}: {
  initialEmployees: Employee[];
}) {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    initialEmployees[0] || null
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept
        ? emp.department?.name === selectedDept
        : true;

      const matchesStatus = selectedStatus
        ? emp.status === selectedStatus
        : true;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, selectedDept, selectedStatus]);

  const departmentsList = useMemo(() => {
    const depts = employees.map((e) => e.department?.name).filter(Boolean);
    return Array.from(new Set(depts));
  }, [employees]);

  const currentUser = getUser();
  const handleRemove = async (id: string) => {
    if (currentUser?.id === id) {
      toast.error("You cannot delete yourself");
      return;
    }
    try {
      await employeeApi.remove(id);

      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === id ? { ...e, status: 'Inactive' as const } : e
        )
      );
    } catch (err: any) {
      const message = err?.message || 'Failed to delete employee';
      toast.error(message);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await employeeApi.update(id, { status: 'Active' });
      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === id ? { ...e, status: 'Active' as const } : e
        )
      );
      toast.success('Employee reactivated');
    } catch (err: any) {
      const message = err?.message || 'Failed to reactivate employee';
      toast.error(message);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/employees/edit/${id}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full">
        <h2 className="text-xl font-bold mb-6">Employee Management</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Employees..."
            className="w-full px-3 py-2 border rounded-lg"
          />

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Department</option>
            {departmentsList.map((d) => (
              <option key={d} value={d!}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={() => router.push("/employees/add")}
            className="bg-blue-100 text-blue-700 rounded-lg"
          >
            Add Employee +
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp, index) => (
              <tr key={emp.employee_id} className="border-b">
                <td>{String(index + 1).padStart(2, '0')}</td>

                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {emp.full_name?.charAt(0)}
                    </div>
                    {emp.full_name}
                  </div>
                </td>

                <td>{emp.department?.name || "Unassigned"}</td>

                <td>{emp.status}</td>

                <td className="text-right space-x-2">
                  <button onClick={() => handleEdit(emp.employee_id)}>
                    Edit
                  </button>

                  {emp.status === 'Active' ? (
                    <button onClick={() => handleRemove(emp.employee_id)}>
                      Remove
                    </button>
                  ) : (
                    <button onClick={() => handleReactivate(emp.employee_id)}>
                      Reactivate
                    </button>
                  )}

                  <button onClick={() => setSelectedEmployee(emp)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-[420px] bg-white p-6 rounded-xl border">
        {selectedEmployee ? (
          <>
            <div className="flex justify-between">
              <h2 className="font-bold">Employee Detail</h2>

              <div className="space-y-2">
                <button onClick={() => handleEdit(selectedEmployee.employee_id)}>
                  Update
                </button>

                {selectedEmployee.status === 'Active' ? (
                  <button onClick={() => handleRemove(selectedEmployee.employee_id)}>
                    Remove
                  </button>
                ) : (
                  <button onClick={() => handleReactivate(selectedEmployee.employee_id)}>
                    Reactivate
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <p>{selectedEmployee.full_name}</p>
              <p>{selectedEmployee.email}</p>
              <p>{selectedEmployee.department?.name}</p>
            </div>
          </>
        ) : (
          <p>No employee selected</p>
        )}
      </div>
    </div>
  );
}