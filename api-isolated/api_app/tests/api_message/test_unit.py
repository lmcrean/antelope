import unittest
from django.test import Client
from rest_framework import status

class APIMessageTests(unittest.TestCase):
    def setUp(self):
        """Set up test client"""
        self.client = Client()
    
    def test_get_api_message(self):
        """Test that GET request returns expected message"""
        response = self.client.get('/api/test/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.json())
        self.assertEqual(response.json()['message'], 'API is working!')
    
    def test_post_not_allowed(self):
        """Test that POST request is not allowed"""
        response = self.client.post('/api/test/')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

if __name__ == '__main__':
    unittest.main()
