import pytest
from api_app.tests.utils.prod_visit import visit_prod_endpoint

def test_api_message_prod():
    """Test that the production API message endpoint returns the expected message."""
    response = visit_prod_endpoint("/")
    
    # Verify response status code
    assert response.status_code == 200
    
    # Verify response content
    data = response.json()
    assert "message" in data
    assert data["message"] == "API is working!"
