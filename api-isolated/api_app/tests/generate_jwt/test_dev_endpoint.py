import pytest
import re
import requests
from django.urls import reverse
from rest_framework import status

pytestmark = [pytest.mark.jwt, pytest.mark.integration]

@pytest.fixture
def dev_server_url():
    """Fixture for development server base URL"""
    return 'http://localhost:8000'

def test_dev_server_jwt_endpoint(dev_server_url):
    """Test JWT endpoint is accessible on development server"""
    # Get the endpoint paths
    jwt_path = reverse('get_test_token').lstrip('/')
    full_url = f"{dev_server_url}/{jwt_path}"
    
    try:
        # Test token generation
        response = requests.get(full_url)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert 'token' in data
        assert data['token']
        assert len(data['token']) > 0
        
        # Verify JWT token format
        assert re.match(r"^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$", data['token'])
        
        # Test the token with user lifecycle endpoint
        token = data['token']
        lifecycle_path = reverse('test_user_lifecycle').lstrip('/')
        lifecycle_url = f"{dev_server_url}/{lifecycle_path}"
        
        headers = {'Authorization': f'Bearer {token}'}
        protected_response = requests.get(lifecycle_url, headers=headers)
        assert protected_response.status_code == status.HTTP_200_OK
        
    except requests.ConnectionError:
        pytest.skip("Development server is not running. Start it with 'python manage.py runserver' to run this test.") 