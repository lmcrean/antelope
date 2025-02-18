from django.test import TestCase, Client
from django.urls import reverse
import json
import re

class JWTAuthenticationTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.jwt_test_url = reverse("jwt_test")  # This will now resolve to /api/auth/test/

    def test_create_and_authenticate_user(self):
        """Test JWT token generation with service role permissions"""
        
        # Make the POST request to get a JWT token with a test Bearer token
        response = self.client.post(
            self.jwt_test_url,
            content_type="application/json",
            HTTP_AUTHORIZATION="Bearer test-token"
        )
        
        # Print response content if status code is not 200
        if response.status_code != 200:
            print(f"\nError Response: {response.content.decode()}")
            print(f"\nRequest URL: {self.jwt_test_url}")
        
        # Check if the response is successful
        self.assertEqual(response.status_code, 200)
        
        # Parse the response data
        data = json.loads(response.content)
        
        # Check if all required fields are present
        self.assertIn("message", data)
        self.assertIn("user", data)
        self.assertIn("jwt", data)
        
        # Check if we got a list of two success messages
        self.assertEqual(len(data["message"]), 2)
        
        # Check if the messages match our expected format
        self.assertEqual(
            data["message"][0],
            "Success: generated JWT token"
        )
        self.assertEqual(
            data["message"][1],
            "Success: token has service role permissions"
        )
        
        # Verify user is service_role
        self.assertEqual(data["user"], "service_role")
        
        # Verify JWT token is present and non-empty
        self.assertTrue(data["jwt"])
        self.assertTrue(len(data["jwt"]) > 0)
        
        # Verify JWT token format (should be three dot-separated base64 strings)
        self.assertTrue(re.match(r"^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$", data["jwt"])) 