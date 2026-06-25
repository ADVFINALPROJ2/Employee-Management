import { apiClient } from "./api";

export interface EmployeeFilterQuery {
  search?: string;
  department_id?: string;
  status?: string;
}

export const employeeApi = {
  getAll: (query?: string) =>
    apiClient.get(`/employee${query ? `?${query}` : ""}`),

  getOne: (id: string) => apiClient.get(`/employee/${id}`),

  getDepartments: () => apiClient.get("/employee/departments"),

  create: (data: any) => apiClient.post("/employee/create", data),

  update: (id: string, data: any) =>
    apiClient.patch(`/employee/${id}`, data),

  remove: (id: string) => apiClient.delete(`/employee/${id}`),
};
