'use client';

import { useEffect, useState } from "react";
import EmployeeDashboardClient from "./EmployeeDashboardClient";
import { employeeApi } from "@/lib/employee-api";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await employeeApi.getAll();
        setEmployees(Array.isArray(res) ? res : res?.data ?? []);
      } catch (err) {
        console.error("Failed to load employees:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-gray-500 font-medium">Loading employee databases...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 md:p-8 font-sans text-gray-800 antialiased">
      <div className="w-full mx-auto space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 pl-1">
          Employee Management Page
        </h1>

        <EmployeeDashboardClient initialEmployees={employees} />
      </div>
    </div>
  );
}