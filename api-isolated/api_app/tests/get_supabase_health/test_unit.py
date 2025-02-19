import pytest
import requests
from django.urls import reverse
from rest_framework import status
from ..utils.dev_server import dev_server

@pytest.mark.unit
def test_health_check_endpoint(dev_server):
    """Test Supabase health check endpoint"""
    url = f"{dev_server}/api/health/"
    response = requests.get(url)
    if response.status_code != status.HTTP_200_OK:
        print(f"Error response content: {response.text}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['status'] == 'healthy'
    assert data['supabase_connected'] is True

@pytest.mark.unit
def test_health_check_response_structure(dev_server):
    """Test health check response structure"""
    url = f"{dev_server}/api/health/"
    response = requests.get(url)
    if response.status_code != status.HTTP_200_OK:
        print(f"Error response content: {response.text}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Check that response contains all expected fields
    required_fields = {
        'status',
        'message',
        'supabase_connected',
        'supabase_url_configured',
        'supabase_key_configured'
    }
    
    # More pythonic way to check all fields exist
    assert all(field in data for field in required_fields), f"Missing fields: {required_fields - data.keys()}" 