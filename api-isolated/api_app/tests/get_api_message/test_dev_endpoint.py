import pytest
from rest_framework import status

@pytest.mark.django_db
def test_api_message_dev(client):
    """
    Test the API message endpoint in development mode
    """
    response = client.get('/api/test/')
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert 'message' in data
    assert data['message'] == 'API is working!'

@pytest.mark.django_db
def test_api_message_dev_method_not_allowed(client):
    """
    Test that POST requests are not allowed on the API message endpoint
    """
    response = client.post('/api/test/')
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
