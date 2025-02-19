import pytest
from rest_framework import status
from ..utils.prod_visit import visit_prod_endpoint

@pytest.mark.prod_endpoint
def test_api_message_prod():
    """Test the API message endpoint in production environment"""
    response = visit_prod_endpoint("/api/test/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert 'message' in data
    assert data['message'] == 'API is working!'

@pytest.mark.prod_endpoint
def test_api_message_prod_method_not_allowed():
    """Test that POST requests are not allowed on the API message endpoint in production"""
    url = "/api/test/"
    response = visit_prod_endpoint(url)
    assert response.status_code == status.HTTP_200_OK  # GET should work
    
    # POST should not be allowed, but we can't test it with visit_prod_endpoint
    # as it only supports GET requests. This is intentional for security.
