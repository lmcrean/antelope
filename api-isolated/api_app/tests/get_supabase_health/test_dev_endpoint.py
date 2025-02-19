import pytest
import requests
from django.urls import reverse
from rest_framework import status
from ..utils.dev_server import dev_server

@pytest.mark.dev_endpoint
def test_dev_health_check(dev_server):
    """Test health check endpoint in dev environment"""
    url = f"{dev_server}/api/health/"
    response = requests.get(url)
    
    # In dev environment without Supabase configured, we expect a 500 status
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    data = response.json()
    
    # Verify error response structure
    assert data['status'] == 'unhealthy'
    assert data['supabase_connected'] is False
    assert 'Error connecting to Supabase' in data['message']

@pytest.mark.dev_endpoint
def test_dev_config_check(dev_server):
    """Test configuration check in dev environment"""
    url = f"{dev_server}/api/health/"
    response = requests.get(url)
    
    # In dev environment without Supabase configured, we expect a 500 status
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    data = response.json()
    
    # Even though connection fails, we can verify the config flags
    assert data['supabase_url_configured'] is True
    assert data['supabase_key_configured'] is True
    
    # Additional checks for error state
    assert data['status'] == 'unhealthy'
    assert data['supabase_connected'] is False

@pytest.mark.dev_endpoint
def test_dev_health_check_method_not_allowed(dev_server):
    """Test health check endpoint rejects invalid methods"""
    url = f"{dev_server}/api/health/"
    response = requests.post(url)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED 