from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
import json
import random
import string
import os
from unittest.mock import patch, MagicMock
from ..utils import get_supabase_client

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
        self.mock_user.email = self.test_email
        
        # Mock the sign_up response
        self.mock_supabase.auth.sign_up.return_value = MagicMock(
            user=self.mock_user
        )
        
        # Mock the sign_in response
        self.mock_supabase.auth.sign_in_with_password.return_value = MagicMock(
            session={"access_token": "test-token"}
        )
        
        # Mock the admin list_users response
        self.mock_supabase.auth.admin.list_users.return_value = [self.mock_user]
        
        # Mock the admin update_user response
        self.mock_supabase.auth.admin.update_user_by_id.return_value = self.mock_user
        
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
                'email': self.test_email,
                'password': self.test_password,
                'username': self.test_username
            }),
            content_type='application/json'
        )
        
        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)
        signup_data = json.loads(signup_response.content)
        self.assertEqual(signup_data['message'], 'User created successfully')
        self.assertEqual(signup_data['user']['email'], self.test_email)
        self.assertEqual(signup_data['user']['username'], self.test_username)
        
        # Verify sign_up was called with correct data
        self.mock_supabase.auth.sign_up.assert_called_once_with({
            'email': self.test_email,
            'password': self.test_password,
            'data': {'username': self.test_username}
        })
        
        # Step 2: Sign in
        signin_response = self.client.post(
            self.signin_url,
            data=json.dumps({
                'email': self.test_email,
                'password': self.test_password
            }),
            content_type='application/json'
        )
        
        self.assertEqual(signin_response.status_code, status.HTTP_200_OK)
        signin_data = json.loads(signin_response.content)
        self.assertEqual(signin_data['message'], 'User signed in successfully')
        self.assertIn('session', signin_data)
        
        # Verify sign_in was called with correct data
        self.mock_supabase.auth.sign_in_with_password.assert_called_once_with({
            'email': self.test_email,
            'password': self.test_password
        })
        
        # Step 3: Delete user
        delete_response = self.client.delete(
            self.delete_url,
            data=json.dumps({
                'email': self.test_email
            }),
            content_type='application/json'
        )
        
        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)
        
        # Verify list_users and delete_user were called
        self.mock_supabase.auth.admin.list_users.assert_called()
        self.mock_supabase.auth.admin.delete_user.assert_called_once_with(self.mock_user.id)
        
        # For the final verification, we'll make sign_in raise an error
        self.mock_supabase.auth.sign_in_with_password.side_effect = Exception("User not found")
        
        # Verify user is deleted by attempting to sign in
        verify_signin_response = self.client.post(
            self.signin_url,
            data=json.dumps({
                'email': self.test_email,
                'password': self.test_password
            }),
            content_type='application/json'
        )
        
        self.assertEqual(verify_signin_response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR) 