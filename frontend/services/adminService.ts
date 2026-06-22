import axios from 'axios';

const api = axios.create({ 
  baseURL: 'http://localhost:5000/api/leave/admin' 
});

export const getAuditLogs = async (page: number, limit: number) => {
  try {
    const response = await api.get('/audit-logs', {
      params: { page, limit }
    });
    // Returning response.data assuming the backend returns the array directly.
    // If your backend returns an object like { logs: [] }, use response.data.logs
    return response.data;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

export default api;