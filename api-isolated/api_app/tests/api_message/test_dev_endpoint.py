import pytest
from django.test import Client
from rest_framework import status

@pytest.mark.django_db
def test_api_message_dev():
    """
    Test the API message endpoint in development mode
    """
    client = Client()
    response = client.get('/api/test/')
    
    assert response.status_code == status.HTTP_200_OK
    assert 'message' in response.json()
    assert response.json()['message'] == 'API is working!'

@pytest.mark.django_db
def test_api_message_dev_method_not_allowed():
    """
    Test that POST requests are not allowed on the API message endpoint
    """
    client = Client()
    response = client.post('/api/test/')
    
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
