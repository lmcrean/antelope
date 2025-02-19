from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
import json
import random
import string
import time

class UserLifecycleTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('test_user_lifecycle')
        
        # Generate random test user credentials
        random_string = ''.join(random.choices(string.ascii_lowercase, k=8))
        self.test_username = f"test_user_{random_string}"
        self.test_password = ''.join(random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=12))
        
        # Test token for authorization
        self.test_token = 'test-token'

    def test_user_lifecycle(self):
        """Test complete user lifecycle in a single request"""
        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.test_token}'}
        data = {
            'username': self.test_username,
            'password': self.test_password
        }
        
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            **headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = json.loads(response.content)
        
        self.assertEqual(response_data['message'], 'User lifecycle test completed successfully')
        self.assertEqual(response_data['details']['signup'], 'success')
        self.assertEqual(response_data['details']['signin'], 'success')
        self.assertEqual(response_data['details']['delete'], 'success')

    def test_missing_token(self):
        """Test request without authorization token"""
        data = {
            'username': self.test_username,
            'password': self.test_password
        }
        
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Missing or invalid Authorization header', json.loads(response.content)['error'])

    def test_invalid_token(self):
        """Test request with invalid authorization token"""
        headers = {'HTTP_AUTHORIZATION': 'Bearer invalid-token'}
        data = {
            'username': self.test_username,
            'password': self.test_password
        }
        
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            **headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Invalid token', json.loads(response.content)['error'])

    def test_missing_credentials(self):
        """Test request without username or password"""
        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.test_token}'}
        
        # Test missing username
        response = self.client.post(
            self.url,
            data=json.dumps({'password': self.test_password}),
            content_type='application/json',
            **headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Missing credentials', json.loads(response.content)['error'])
        
        # Test missing password
        response = self.client.post(
            self.url,
            data=json.dumps({'username': self.test_username}),
            content_type='application/json',
            **headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Missing credentials', json.loads(response.content)['error']) 