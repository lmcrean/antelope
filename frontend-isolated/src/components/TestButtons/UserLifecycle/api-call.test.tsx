import axios from 'axios';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('User Lifecycle API Calls', () => {
  // Generate a unique username for this test run to avoid conflicts
  const timestamp = new Date().getTime();
  const testUser = {
    username: `testuser_${timestamp}`,
    password: `Test${timestamp}!`
  };

  // Add delay between tests
  beforeAll(() => {
    // Set longer timeout for the entire test suite
    vi.setConfig({ testTimeout: 10000 });
  });

  it('should successfully sign up a new user', async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/signup/`, {
      username: testUser.username,
      password: testUser.password
    });

    expect(response.status).toBe(201);
    expect(response.data.message).toBe('User created successfully');
    expect(response.data.user.username).toBe(testUser.username);

    // Wait after signup to ensure user is created in Supabase
    await wait(2000);
  });

  it('should successfully sign in the user', async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/signin/`, {
      username: testUser.username,
      password: testUser.password
    });

    expect(response.status).toBe(200);
    expect(response.data.message).toBe('User signed in successfully');
    expect(response.data.session).toBeDefined();

    // Wait after signin to avoid rate limiting
    await wait(1000);
  });

  it('should successfully delete the user', async () => {
    const response = await axios.delete(`${API_BASE_URL}/auth/delete/`, {
      data: {
        username: testUser.username
      }
    });

    expect(response.status).toBe(200);

    // Wait to ensure user is deleted
    await wait(1000);

    // Verify user is deleted by attempting to sign in
    try {
      await axios.post(`${API_BASE_URL}/auth/signin/`, {
        username: testUser.username,
        password: testUser.password
      });
      throw new Error('Expected signin to fail after user deletion');
    } catch (error: any) {
      expect(error.response.status).toBe(500);
    }
  });
});
