import pytest
import requests
from rest_framework import status
from ..utils.dev_server import dev_server

@pytest.mark.dev_endpoint
def test_api_message_dev(dev_server):
    """Test the API message endpoint in development mode"""
    url = f"{dev_server}/api/test/"
    response = requests.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert 'message' in data
    assert data['message'] == 'API is working!'

@pytest.mark.dev_endpoint
def test_api_message_dev_method_not_allowed(dev_server):
    """Test that POST requests are not allowed on the API message endpoint"""
    url = f"{dev_server}/api/test/"
    response = requests.post(url)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
