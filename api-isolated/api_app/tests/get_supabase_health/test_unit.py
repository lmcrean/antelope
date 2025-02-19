import pytest
from django.urls import reverse
from rest_framework import status
from django.test import Client

@pytest.mark.unit
def test_health_check_endpoint(client):
    """Test Supabase health check endpoint"""
    url = reverse('health_check')
    response = client.get(url)
    
    # In test environment, we expect a 500 status since Supabase is not configured
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    
    data = response.json()
    assert data['status'] == 'unhealthy'
    assert data['supabase_connected'] is False
    assert 'Error connecting to Supabase' in data['message']

@pytest.mark.unit
def test_health_check_response_structure(client):
    """Test health check response structure"""
    url = reverse('health_check')
    response = client.get(url)
    if response.status_code != status.HTTP_200_OK:
        print(f"Error response content: {response.content.decode()}")
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