from django.test import TestCase, Client
from django.urls import reverse
import json
import re

class JWTAuthenticationTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.jwt_test_url = reverse("get_test_token")  # Updated to use new endpoint

    def test_get_jwt_token(self):
        """Test simple JWT token generation endpoint"""
        
        # Make the GET request to get a JWT token
        response = self.client.get(self.jwt_test_url)
        
        # Print response content if status code is not 200
        if response.status_code != 200:
            print(f"\nError Response: {response.content.decode()}")
            print(f"\nRequest URL: {self.jwt_test_url}")
        
        # Check if the response is successful
        self.assertEqual(response.status_code, 200)
        
        # Parse the response data
        data = json.loads(response.content)
        
        # Check if token is present
        self.assertIn("token", data)
        
        # Verify JWT token is present and non-empty
        self.assertTrue(data["token"])
        self.assertTrue(len(data["token"]) > 0)
        
        # Verify JWT token format (should be three dot-separated base64 strings)
        self.assertTrue(re.match(r"^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$", data["token"])) 