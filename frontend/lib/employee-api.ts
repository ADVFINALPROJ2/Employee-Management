// lib/employee-api.ts
import { apiClient } from "./api";

export interface EmployeeFilterQuery {
  search?: string;
  department_id?: string;
  status?: string;
}

export const employeeApi = {
  // Pass dynamic search strings or filters directly to the backend
  getAll: (query = "") => apiClient.get(`/employee${query}`),

  getOne: (id: string) => apiClient.get(`/employee/${id}`),

  create: (data: any) => apiClient.post("/employee/create", data),

  update: (id: string, data: any) => apiClient.patch(`/employee/${id}`, data),

  remove: (id: string) => apiClient.delete(`/employee/${id}`),
};