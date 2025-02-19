import pytest
import requests
import random
import string
import json
from rest_framework import status
from ..utils import dev_server

@pytest.mark.dev_endpoint
class TestUserLifecycleDevEndpoint:
    @pytest.fixture(autouse=True)
    def setup(self):
        """Set up test environment"""
        # Generate random test user credentials
        random_string = ''.join(random.choices(string.ascii_lowercase, k=8))
        self.test_username = f"test_user_{random_string}"
        self.test_password = ''.join(random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=12))
        self.test_token = 'test-token'
        
    def test_dev_user_lifecycle(self, dev_server):
        """Test user lifecycle in dev environment"""
        url = f"{dev_server}/api/auth/test/"
        headers = {'Authorization': f'Bearer {self.test_token}'}
        data = {
            'username': self.test_username,
            'password': self.test_password
        }
        
        response = requests.post(url, json=data, headers=headers)
        assert response.status_code == status.HTTP_200_OK
        
        response_data = response.json()
        assert response_data['message'] == 'User lifecycle test completed successfully'
        assert response_data['details']['signup'] == 'success'
        assert response_data['details']['signin'] == 'success'
        assert response_data['details']['delete'] == 'success'

    def test_dev_missing_token(self, dev_server):
        """Test user lifecycle without token in dev environment"""
        url = f"{dev_server}/api/auth/test/"
        data = {
            'username': self.test_username,
            'password': self.test_password
        }
        
        response = requests.post(url, json=data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'Missing or invalid Authorization header' in response.json()['error']

    def test_dev_invalid_token(self, dev_server):
        """Test user lifecycle with invalid token in dev environment"""
        url = f"{dev_server}/api/auth/test/"
        headers = {'Authorization': 'Bearer invalid-token'}
        data = {
            'username': self.test_username,
            'password': self.test_password
        }
        
        response = requests.post(url, json=data, headers=headers)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'Invalid token' in response.json()['error']

    def test_dev_missing_credentials(self, dev_server):
        """Test user lifecycle without credentials in dev environment"""
        url = f"{dev_server}/api/auth/test/"
        headers = {'Authorization': f'Bearer {self.test_token}'}
        
        # Test missing username
        response = requests.post(url, json={'password': self.test_password}, headers=headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Missing credentials' in response.json()['error']
        
        # Test missing password
        response = requests.post(url, json={'username': self.test_username}, headers=headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Missing credentials' in response.json()['error'] 