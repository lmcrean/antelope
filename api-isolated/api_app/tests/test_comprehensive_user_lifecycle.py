import unittest
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
import requests
import json
import random
import string
import time
import logging
from unittest.mock import patch, MagicMock
from ..utils import get_supabase_client

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ComprehensiveUserLifecycleTest(TestCase):
    """
    Comprehensive test suite for user lifecycle that combines unit tests and E2E tests.
    Tests both the Django endpoints and direct API calls.
    """
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.API_BASE_URL = "http://localhost:8000/api"
        
    def setUp(self):
        self.client = Client()
        # Django URL patterns
        self.signup_url = reverse('signup')
        self.signin_url = reverse('signin')
        self.delete_url = reverse('delete_user')
        self.jwt_test_url = reverse('jwt_test')
        
        # Direct API endpoints
        self.api_signup_url = f"{self.API_BASE_URL}/auth/signup/"
        self.api_signin_url = f"{self.API_BASE_URL}/auth/signin/"
        self.api_delete_url = f"{self.API_BASE_URL}/auth/delete/"
        self.api_jwt_test_url = f"{self.API_BASE_URL}/auth/test/"
        
        # Generate random test user credentials
        random_string = ''.join(random.choices(string.ascii_lowercase, k=8))
        timestamp = int(time.time())
        self.test_username = f"test_user_{random_string}_{timestamp}"
        self.test_password = ''.join(random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=12))
        self.test_email = f"{self.test_username.lower()}.{timestamp}@temp.example.com"
        
        # Set up mock Supabase client for unit tests
        self.setup_mock_supabase()
        
    def setup_mock_supabase(self):
        """Set up mock Supabase client for unit testing"""
        self.mock_supabase = MagicMock()
        self.mock_user = MagicMock()
        self.mock_user.id = "test-user-id"
        self.mock_user.email = self.test_email
        self.mock_user.user_metadata = {'username': self.test_username, 'is_temp_email': True}
        
        # Mock create_user
        self.mock_supabase.auth.admin.create_user.return_value = self.mock_user
        
        # Mock list_users
        mock_users_response = MagicMock()
        mock_users_response.users = [self.mock_user]
        self.mock_supabase.auth.admin.list_users.return_value = mock_users_response.users
        
        # Mock sign_in
        mock_session = MagicMock()
        mock_session.access_token = "test-token"
        mock_session.refresh_token = "test-refresh-token"
        mock_session.expires_in = 3600
        
        mock_auth_response = MagicMock()
        mock_auth_response.session = mock_session
        mock_auth_response.user = self.mock_user
        self.mock_supabase.auth.sign_in_with_password.return_value = mock_auth_response
        
        # Mock delete_user
        self.mock_supabase.auth.admin.delete_user.return_value = None
        
        # Start the patch
        self.patcher = patch('api_app.utils.create_client', return_value=self.mock_supabase)
        self.patcher.start()
    
    def tearDown(self):
        self.patcher.stop()
    
    def test_unit_user_lifecycle(self):
        """Test complete user lifecycle using Django test client"""
        logger.info("Starting Unit Test User Lifecycle")
        
        # Step 1: Sign up
        signup_data = {
            'username': self.test_username,
            'password': self.test_password
        }
        signup_response = self.client.post(
            self.signup_url,
            data=json.dumps(signup_data),
            content_type='application/json'
        )
        
        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)
        signup_result = json.loads(signup_response.content)
        self.assertEqual(signup_result['message'], 'User created successfully')
        self.assertEqual(signup_result['user']['username'], self.test_username)
        
        # Step 2: Sign in
        signin_data = {
            'username': self.test_username,
            'password': self.test_password
        }
        signin_response = self.client.post(
            self.signin_url,
            data=json.dumps(signin_data),
            content_type='application/json'
        )
        
        self.assertEqual(signin_response.status_code, status.HTTP_200_OK)
        signin_result = json.loads(signin_response.content)
        self.assertEqual(signin_result['message'], 'User signed in successfully')
        self.assertIn('session', signin_result)
        
        # Get the access token
        access_token = signin_result['session']['access_token']
        
        # Step 3: Test JWT with proper authorization header
        jwt_response = self.client.post(
            self.jwt_test_url,
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        
        self.assertEqual(jwt_response.status_code, status.HTTP_200_OK)
        jwt_result = json.loads(jwt_response.content)
        self.assertIn('jwt', jwt_result)
        
        # Step 4: Delete user
        delete_data = {
            'username': self.test_username
        }
        delete_response = self.client.delete(
            self.delete_url,
            data=json.dumps(delete_data),
            content_type='application/json'
        )
        
        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)
        
        # Update mock to return empty list after deletion
        self.mock_supabase.auth.admin.list_users.return_value = []
        
        # Step 5: Verify deletion by attempting to sign in
        verify_signin_response = self.client.post(
            self.signin_url,
            data=json.dumps(signin_data),
            content_type='application/json'
        )
        
        self.assertEqual(verify_signin_response.status_code, status.HTTP_404_NOT_FOUND)
        
    def test_e2e_user_lifecycle(self):
        """Test complete user lifecycle using direct API calls"""
        logger.info("Starting E2E Test User Lifecycle")
        
        # Step 1: Sign up
        signup_data = {
            'username': self.test_username,
            'password': self.test_password
        }
        signup_response = requests.post(
            self.api_signup_url,
            json=signup_data
        )
        
        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)
        signup_result = signup_response.json()
        self.assertEqual(signup_result['message'], 'User created successfully')
        self.assertEqual(signup_result['user']['username'], self.test_username)
        
        # Step 2: Sign in
        signin_data = {
            'username': self.test_username,
            'password': self.test_password
        }
        signin_response = requests.post(
            self.api_signin_url,
            json=signin_data
        )
        
        self.assertEqual(signin_response.status_code, status.HTTP_200_OK)
        signin_result = signin_response.json()
        self.assertEqual(signin_result['message'], 'User signed in successfully')
        self.assertIn('session', signin_result)
        
        # Get the access token
        access_token = signin_result['session']['access_token']
        
        # Step 3: Test JWT with proper authorization header
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        jwt_response = requests.post(
            self.api_jwt_test_url,
            headers=headers
        )
        
        self.assertEqual(jwt_response.status_code, status.HTTP_200_OK)
        jwt_result = jwt_response.json()
        self.assertIn('jwt', jwt_result)
        
        # Step 4: Delete user
        delete_data = {
            'username': self.test_username
        }
        delete_response = requests.delete(
            self.api_delete_url,
            json=delete_data,
            headers=headers
        )
        
        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)
        
        # Step 5: Verify deletion by attempting to sign in
        verify_signin_response = requests.post(
            self.api_signin_url,
            json=signin_data
        )
        
        self.assertEqual(verify_signin_response.status_code, status.HTTP_404_NOT_FOUND)
        
    def test_error_cases(self):
        """Test various error cases in the user lifecycle"""
        logger.info("Starting Error Cases Test")
        
        # Test 1: Sign up with missing password
        invalid_signup = {
            'username': self.test_username
        }
        response = self.client.post(
            self.signup_url,
            data=json.dumps(invalid_signup),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test 2: Sign in with non-existent user
        invalid_signin = {
            'username': 'nonexistent_user',
            'password': 'wrong_password'
        }
        response = self.client.post(
            self.signin_url,
            data=json.dumps(invalid_signin),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Test 3: Delete non-existent user
        invalid_delete = {
            'username': 'nonexistent_user'
        }
        response = self.client.delete(
            self.delete_url,
            data=json.dumps(invalid_delete),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

if __name__ == '__main__':
    unittest.main() 