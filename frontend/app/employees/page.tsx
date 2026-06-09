import { employeeApi } from "@/lib/employee-api";

export default async function EmployeesPage() {
  const employees = await employeeApi.getAll();

  return (
    <div>
      <h1>Employees</h1>

      {employees.map((emp: any) => (
        <div key={emp.employee_id}>
          {emp.full_name} - {emp.email}
        </div>
      ))}
    </div>
  );
}