from django.test import TestCase
from django.urls import reverse
from rest_framework import status

class JWTDevEndpointTest(TestCase):
    def setUp(self):
        """Set up test environment"""
        self.url = reverse('get_test_token')

    def test_dev_token_generation(self):
        """Test JWT token generation in dev environment"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_dev_token_validation(self):
        """Test JWT token validation in dev environment"""
        # Get a token first
        token_response = self.client.get(self.url)
        token = token_response.data['token']

        # Test the token with a protected endpoint
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        response = self.client.get(reverse('test_user_lifecycle'), **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK) 