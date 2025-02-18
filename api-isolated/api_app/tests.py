import unittest
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
import os

class TestAPIEndpoints(TestCase):
    def setUp(self):
        self.client = Client()
        self.prod_url = "https://team5-api-eu-5d24fa110c36.herokuapp.com"
        self.dev_url = "http://127.0.0.1:8000"
    
    def test_dev_api_is_working_endpoint(self):
        """Test that the development /test endpoint returns API is working"""
        response = self.client.get('/test/')
        print(f"\nDevelopment Test:")
        print(f"Status Code: {response.status_code}")
        print(f"Response Content: {response.content.decode()}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "API is working!")

    @unittest.skip("Skipping deployed API test while focusing on development")
    def test_prod_api_is_working_endpoint(self):
        """Test that the deployed /test endpoint returns API is working"""
        response = requests.get(f"{self.prod_url}/test/")
        print(f"\nProduction Test:")
        print(f"Status Code: {response.status_code}")
        print(f"Response Content: {response.text}")
        print(f"Response Headers: {response.headers}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "API is working!")

class HealthCheckE2ETest(TestCase):
    def setUp(self):
        self.client = Client()
        self.health_url = reverse('health_check')
        # Ensure we have test environment variables
        os.environ['SUPABASE_URL'] = 'https://rswjntosbmbwagqidpcp.supabase.co'
        os.environ['SUPABASE_KEY'] = 'test-key'

    def test_health_check_endpoint(self):
        """
        Test that the health check endpoint returns a response
        and includes Supabase configuration status
        """
        response = self.client.get(self.health_url)
        data = response.json()
        
        # We expect a response regardless of connection status
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR])
        
        # Check that configuration status is reported correctly
        self.assertTrue(data['supabase_url_configured'])
        self.assertTrue(data['supabase_key_configured'])
        
        # Basic response structure should be present
        self.assertIn('status', data)
        self.assertIn('message', data)
        self.assertIn('supabase_connected', data)

    def test_health_check_response_structure(self):
        """
        Test that the health check response contains all required fields
        """
        response = self.client.get(self.health_url)
        data = response.json()
        
        # Check that response contains all expected fields
        required_fields = [
            'status',
            'message',
            'supabase_connected',
            'supabase_url_configured',
            'supabase_key_configured'
        ]
        
        for field in required_fields:
            self.assertIn(field, data)

if __name__ == '__main__':
    unittest.main()
