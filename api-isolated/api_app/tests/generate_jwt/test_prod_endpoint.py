import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

@pytest.mark.skip(reason="Skipping production endpoint test")
class JWTProdEndpointTest(APITestCase):
    """Test JWT token generation in production environment"""
    
    def setUp(self):
        """Set up test case"""
        self.url = reverse('get_test_token')
        
    def test_prod_token_generation(self):
        """Test JWT token generation in production environment"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        
    def test_prod_token_validation(self):
        """Test JWT token validation in production environment"""
        # Get a token first
        token_response = self.client.get(self.url)
        token = token_response.data['token']
        
        # Test the token with a protected endpoint
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        response = self.client.get(reverse('test_user_lifecycle'), **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_invalid_token_rejection(self):
        """Test that invalid tokens are rejected in production"""
        headers = {'HTTP_AUTHORIZATION': 'Bearer invalid-token'}
        response = self.client.get(reverse('test_user_lifecycle'), **headers)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) 