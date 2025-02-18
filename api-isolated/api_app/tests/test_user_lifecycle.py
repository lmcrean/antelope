from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
import json
import random
import string
import os
import time
from ..utils import get_supabase_client

class UserLifecycleTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.signup_url = reverse('signup')
        self.signin_url = reverse('signin')
        self.delete_url = reverse('delete_user')
        
        # Ensure we have test environment variables
        os.environ['SUPABASE_URL'] = 'https://rswjntosbmbwagqidpcp.supabase.co'
        os.environ['SUPABASE_KEY'] = 'test-key'
        
        # Generate random test user credentials
        random_string = ''.join(random.choices(string.ascii_lowercase, k=8))
        self.test_email = f"test.{random_string}@gmail.com"
        self.test_password = ''.join(random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=12))
        self.test_username = f"test_user_{random_string}"

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
        
        # Get the user and verify their email using admin API
        supabase = get_supabase_client()
        users = supabase.auth.admin.list_users()
        user = next((u for u in users if u.email == self.test_email), None)
        self.assertIsNotNone(user, "User should exist in Supabase")
        
        # Verify the user's email
        supabase.auth.admin.update_user_by_id(
            user.id,
            {"email_confirmed_at": "2024-02-18T00:00:00Z"}
        )
        
        # Wait for the email confirmation to propagate
        time.sleep(2)
        
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
        
        # Step 3: Delete user
        delete_response = self.client.delete(
            self.delete_url,
            data=json.dumps({
                'email': self.test_email
            }),
            content_type='application/json'
        )
        
        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)
        
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