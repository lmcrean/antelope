from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
import json
import random
import string
import os
from unittest.mock import patch, MagicMock
from ..utils import get_supabase_client
import time

class UserLifecycleTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.signup_url = reverse('signup')
        self.signin_url = reverse('signin')
        self.delete_url = reverse('delete_user')
        
        # Generate random test user credentials
        random_string = ''.join(random.choices(string.ascii_lowercase, k=8))
        self.test_email = f"test.{random_string}@gmail.com"
        self.test_password = ''.join(random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=12))
        self.test_username = f"test_user_{random_string}"
        
        # Create mock Supabase client
        self.mock_supabase = MagicMock()
        self.mock_user = MagicMock()
        self.mock_user.id = "test-user-id"
        timestamp = int(time.time())
        self.mock_user.email = f"{self.test_username.lower()}.{timestamp}@temp.example.com"
        self.mock_user.user_metadata = {'username': self.test_username, 'is_temp_email': True}
        
        # Mock the admin create_user response
        self.mock_supabase.auth.admin.create_user.return_value = self.mock_user
        
        # Mock the list_users response
        mock_users_response = MagicMock()
        mock_users_response.users = [self.mock_user]
        self.mock_supabase.auth.admin.list_users.return_value = mock_users_response.users
        
        # Mock the sign_in response
        mock_session = MagicMock()
        mock_session.access_token = "test-token"
        mock_session.refresh_token = "test-refresh-token"
        mock_session.expires_in = 3600
        
        mock_auth_response = MagicMock()
        mock_auth_response.session = mock_session
        mock_auth_response.user = self.mock_user
        
        self.mock_supabase.auth.sign_in_with_password.return_value = mock_auth_response
        
        # Mock the admin delete_user response
        self.mock_supabase.auth.admin.delete_user.return_value = None
        
        # Start the patch
        self.patcher = patch('api_app.utils.create_client', return_value=self.mock_supabase)
        self.patcher.start()
        
    def tearDown(self):
        self.patcher.stop()

    def test_user_lifecycle(self):
        """Test complete user lifecycle: signup, signin, and deletion"""
        
        # Step 1: Sign up
        signup_response = self.client.post(
            self.signup_url,
            data=json.dumps({
                'username': self.test_username,
                'password': self.test_password
            }),
            content_type='application/json'
        )
        
        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)
        signup_data = json.loads(signup_response.content)
        self.assertEqual(signup_data['message'], 'User created successfully')
        self.assertEqual(signup_data['user']['username'], self.test_username)
        
        # Verify sign_up was called with correct data
        expected_email = f"{self.test_username.lower()}.{int(time.time())}@temp.example.com"
        self.mock_supabase.auth.admin.create_user.assert_called_once_with({
            'email': expected_email,
            'password': self.test_password,
            'email_confirm': True,
            'user_metadata': {'username': self.test_username, 'is_temp_email': True},
            'app_metadata': {'provider': 'username'}
        })
        
        # Step 2: Sign in
        print(f"Signin URL: {self.signin_url}")
        request_data = {
            'username': self.test_username,
            'password': self.test_password
        }
        print(f"Request data: {json.dumps(request_data)}")
        signin_response = self.client.post(
            self.signin_url,
            data=json.dumps(request_data),
            content_type='application/json'
        )
        print(f"Response status: {signin_response.status_code}")
        print(f"Response content: {signin_response.content}")
        
        self.assertEqual(signin_response.status_code, status.HTTP_200_OK)
        signin_data = json.loads(signin_response.content)
        self.assertEqual(signin_data['message'], 'User signed in successfully')
        self.assertIn('session', signin_data)
        
        # Verify sign_in was called with correct data
        self.mock_supabase.auth.sign_in_with_password.assert_called_once_with({
            'email': expected_email,
            'password': self.test_password
        })
        
        # Step 3: Delete user
        delete_response = self.client.delete(
            self.delete_url,
            data=json.dumps({
                'username': self.test_username
            }),
            content_type='application/json'
        )
        
        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)
        
        # Verify list_users and delete_user were called
        self.mock_supabase.auth.admin.list_users.assert_called()
        self.mock_supabase.auth.admin.delete_user.assert_called_once_with(self.mock_user.id)
        
        # For the final verification, we'll make list_users return empty list
        self.mock_supabase.auth.admin.list_users.return_value = []
        
        # Verify user is deleted by attempting to sign in
        verify_signin_response = self.client.post(
            self.signin_url,
            data=json.dumps({
                'username': self.test_username,
                'password': self.test_password
            }),
            content_type='application/json'
        )
        
        self.assertEqual(verify_signin_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(json.loads(verify_signin_response.content)['error'], f"User with username {self.test_username} not found") 