from django.test import TestCase, Client
from django.urls import reverse
import json
import re

class JWTAuthenticationTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.jwt_test_url = reverse("jwt_test")

    def test_create_and_authenticate_user(self):
        """Test creating a new random user and authenticating them"""
        
        # Make the POST request to create and authenticate user
        response = self.client.post(
            self.jwt_test_url,
            content_type="application/json"
        )
        
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
        
        # Verify the message format
        username = data["user"]
        self.assertTrue(re.match(r"Random_[A-Za-z0-9]{4}", username))
        
        # Check if the messages match our expected format
        self.assertEqual(
            data["message"][0],
            f"Success: new user created {username}"
        )
        self.assertEqual(
            data["message"][1],
            f"Success: signed in as new user {username}"
        )
        
        # Verify JWT token is present and non-empty
        self.assertTrue(data["jwt"])
        self.assertTrue(len(data["jwt"]) > 0)
        
        # Verify JWT token format (should be three dot-separated base64 strings)
        self.assertTrue(re.match(r"^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$", data["jwt"])) 