import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://antelope-api-isolated.herokuapp.com'
  : 'http://localhost:8000';

export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/health/`);
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