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
    return <div className="p-8">Loading employees...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Employee Management Page
        </h1>

        <EmployeeDashboardClient initialEmployees={employees} />
      </div>
    </div>
  );
}