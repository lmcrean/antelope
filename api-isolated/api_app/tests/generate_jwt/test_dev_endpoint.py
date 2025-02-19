import pytest
import re
import requests
from django.urls import reverse
from rest_framework import status
from ..utils import dev_server  # Import the fixture

pytestmark = [pytest.mark.jwt, pytest.mark.integration]

@pytest.mark.dev_endpoint
# Using the dev_server fixture imported from utils
def test_dev_server_jwt_endpoint(dev_server):
    """Test JWT endpoint is accessible on development server"""
    # Get the endpoint path
    jwt_path = reverse('get_test_token').lstrip('/')
    full_url = f"{dev_server}/{jwt_path}"
    
    # Test token generation
    response = requests.get(full_url)
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert 'token' in data
    assert data['token']
    assert len(data['token']) > 0
    
    # Verify JWT token format
    assert re.match(r"^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$", data['token']) 