import axios from 'axios';

// In development, requests to /api are proxied to localhost:8000 by Vite
// In production, /api routes to the backend service
const API_BASE = '/api';

export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE}/health/`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('API endpoint not found');
      }
      if (error.response?.status === 500) {
        throw new Error('Internal server error');
      }
    }
    throw new Error('Failed to check API health');
  }
}; 