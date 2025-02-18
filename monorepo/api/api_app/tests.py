import unittest
import requests
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
import os
from requests.exceptions import ConnectionError

class TestAPIEndpoints(TestCase):
    def setUp(self):
        self.client = Client()
        self.prod_url = "https://antelope-integrated-app-2-1b9c5b5aaf01.herokuapp.com/api"
        self.dev_url = "http://127.0.0.1:8000/api"
    
    def test_dev_api_is_working_endpoint(self):
        """Test that the development /test endpoint returns API is working"""
        response = self.client.get("/api/test/", follow=True)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "API is working!")

    def test_prod_api_is_working_endpoint(self):
        """Test that the deployed /test endpoint returns API is working"""
        try:
            print("\nTesting production API endpoint...")
            print(f"Making request to: {self.prod_url}/test/")
            
            response = requests.get(f"{self.prod_url}/test/")
            print(f"\nResponse Details:")
            print(f"Status Code: {response.status_code}")
            print(f"Content Type: {response.headers.get('Content-Type', 'Not specified')}")
            print(f"\nFull Response Content:")
            print("----------------------------------------")
            print(response.text)
            print("----------------------------------------")
            print(f"\nResponse Headers:")
            for header, value in response.headers.items():
                print(f"{header}: {value}")
            
            # throw an error if the production server is not available
            if response.status_code in [500, 502, 503, 504]:
                raise Exception("Production server is not available")
            
            try:
                data = response.json()
                print(f"\nParsed JSON Response:")
                print(data)
            except requests.exceptions.JSONDecodeError as e:
                print(f"\nFailed to parse JSON response:")
                print(f"Error: {str(e)}")
                print("This suggests we're not getting a JSON response as expected.")
                raise
            
            self.assertEqual(response.status_code, 200)
            self.assertEqual(data["message"], "API is working!")
        except ConnectionError:
            self.skipTest("Could not connect to production server")

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
        response = self.client.get(self.health_url, follow=True)
        
        # We expect a response regardless of connection status
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR])
        
        data = response.json()
        
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
        response = self.client.get(self.health_url, follow=True)
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
