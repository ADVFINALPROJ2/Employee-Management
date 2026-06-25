import { employeeApi } from "@/lib/employee-api";
import EmployeeDashboardClient from "./EmployeeDashboardClient";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  // Fetch initial list of employees
  const response = await employeeApi.getAll();
  const initialEmployees = Array.isArray(response) ? response : response.data || [];

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Employee Management Page</h1>
        <EmployeeDashboardClient initialEmployees={initialEmployees} />
      </div>
    </div>
  );
}