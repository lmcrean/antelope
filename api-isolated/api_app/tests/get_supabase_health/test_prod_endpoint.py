import pytest
from rest_framework import status
from ..utils.prod_visit import visit_prod_endpoint

@pytest.mark.prod_endpoint
def test_prod_health_check_supabase_connection():
    """Test health check endpoint in production environment.
    
    Expected behavior:
    - Should return 200 OK
    - Supabase should be connected
    - All configuration flags should be true
    """
    response = visit_prod_endpoint("/api/health/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['status'] == 'healthy'
    assert data['supabase_connected'] is True
    assert data['supabase_url_configured'] is True
    assert data['supabase_key_configured'] is True
    assert 'message' in data
    assert 'API is configured with Supabase' in data['message']

@pytest.mark.prod_endpoint
def test_prod_health_check_response_structure():
    """Test health check endpoint response structure.
    
    Verify that the response maintains the correct structure and types.
    """
    response = visit_prod_endpoint("/api/health/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Response should have all required fields
    required_fields = ['status', 'message', 'supabase_connected', 'supabase_url_configured', 'supabase_key_configured']
    for field in required_fields:
        assert field in data 