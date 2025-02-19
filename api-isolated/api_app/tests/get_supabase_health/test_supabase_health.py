import pytest
from django.urls import reverse
from rest_framework import status
import os

@pytest.fixture(autouse=True)
def setup_supabase_env():
    """Fixture to set up Supabase environment variables"""
    os.environ['SUPABASE_URL'] = 'https://rswjntosbmbwagqidpcp.supabase.co'
    os.environ['SUPABASE_KEY'] = 'test-key'
    yield
    # Clean up after test
    os.environ.pop('SUPABASE_URL', None)
    os.environ.pop('SUPABASE_KEY', None)

@pytest.fixture
def health_url():
    """Fixture for health check URL"""
    return reverse('health_check')

@pytest.mark.django_db
def test_health_check_endpoint(client, health_url):
    """
    Test that the health check endpoint returns a response
    and includes Supabase configuration status
    """
    response = client.get(health_url)
    data = response.json()
    
    # We expect a response regardless of connection status
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR]
    
    # Check that configuration status is reported correctly
    assert data['supabase_url_configured'] is True
    assert data['supabase_key_configured'] is True
    
    # Basic response structure should be present
    assert 'status' in data
    assert 'message' in data
    assert 'supabase_connected' in data

@pytest.mark.django_db
def test_health_check_response_structure(client, health_url):
    """
    Test that the health check response contains all required fields
    """
    response = client.get(health_url)
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