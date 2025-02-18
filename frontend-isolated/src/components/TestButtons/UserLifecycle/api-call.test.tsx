import axios from 'axios';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

describe('User Lifecycle API Calls', () => {
  const testUser = {
    email: `test.${Math.random().toString(36).substring(7)}@gmail.com`,
    password: Math.random().toString(36).substring(7) + 'Aa1!',
    username: `testuser_${Math.random().toString(36).substring(7)}`
  };

  it('should successfully sign up a new user', async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
      email: testUser.email,
      password: testUser.password,
      username: testUser.username
    });

    expect(response.status).toBe(201);
    expect(response.data.message).toBe('User created successfully');
    expect(response.data.user.email).toBe(testUser.email);
    expect(response.data.user.username).toBe(testUser.username);
  });

  it('should successfully sign in the user', async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
      email: testUser.email,
      password: testUser.password
    });

    expect(response.status).toBe(200);
    expect(response.data.message).toBe('User signed in successfully');
    expect(response.data.session).toBeDefined();
  });

  it('should successfully delete the user', async () => {
    const response = await axios.delete(`${API_BASE_URL}/auth/delete`, {
      data: {
        email: testUser.email
      }
    });

    expect(response.status).toBe(200);

    // Verify user is deleted by attempting to sign in
    try {
      await axios.post(`${API_BASE_URL}/auth/signin`, {
        email: testUser.email,
        password: testUser.password
      });
      throw new Error('Expected signin to fail after user deletion');
    } catch (error: any) {
      expect(error.response.status).toBe(500);
    }
  });
});
