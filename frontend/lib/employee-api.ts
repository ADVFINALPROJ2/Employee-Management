import { apiClient } from "./api";

export const employeeApi = {
  getAll: (query = "") => apiClient.get(`/employee${query}`),

  getOne: (id: string) => apiClient.get(`/employee/${id}`),

  create: (data: any) => apiClient.post("/employee/create", data),

//   update: (id: string, data: any) =>
//     apiClient.patch(`/employee/${id}`, data),

};