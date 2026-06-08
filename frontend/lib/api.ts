const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseResponse(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status);
  }

  return data;
}

export const apiClient = {
  async get(endpoint: string, token?: string) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${BASE_URL}${endpoint}`, { method: 'GET', headers });
    return parseResponse(response);
  },

  async post(endpoint: string, body: any, token?: string) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  }
};
