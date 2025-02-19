import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
import jwt
from django.conf import settings

@pytest.mark.prod_endpoint
class JWTProdEndpointTest(APITestCase):
    """
    Test JWT token generation in production environment
    """
    
    def setUp(self):
        """Set up test case"""
        self.url = reverse('get_test_token')
        
    def test_prod_token_generation(self):
        """Test JWT token generation in production environment"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        
    def test_prod_token_format(self):
        """Test that generated token has correct JWT format"""
        response = self.client.get(self.url)
        token = response.data['token']
        # JWT format: header.payload.signature
        token_parts = token.split('.')
        self.assertEqual(len(token_parts), 3)
        
    def test_prod_token_claims(self):
        """Test that generated token has the expected claims"""
        response = self.client.get(self.url)
        token = response.data['token']
        decoded = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
        
        # Verify required claims
        self.assertIn('user_id', decoded)
        self.assertIn('exp', decoded)
        self.assertIn('iat', decoded)
        self.assertIn('role', decoded)
        
        # Verify claim values
        self.assertEqual(decoded['user_id'], 'test_user')
        self.assertEqual(decoded['role'], 'service_role')
        self.assertTrue(decoded['exp'] > decoded['iat']) 