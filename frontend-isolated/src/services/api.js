import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://antelope-api-isolate-8beb50b26a2a.herokuapp.com'
  : 'http://localhost:8000';

// Configure axios with base URL
axios.defaults.baseURL = API_URL;

export const checkApiHealth = async () => {
  try {
    const response = await axios.get('/api/health/');
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

export const getApiMessage = async () => {
  try {
    const response = await axios.get('/api/test/');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('API endpoint not found');
      }
      if (error.response?.status === 500) {
        throw new Error('Internal server error');
      }
      throw new Error(error.message);
    }
    throw new Error('API Error');
  }
}; 