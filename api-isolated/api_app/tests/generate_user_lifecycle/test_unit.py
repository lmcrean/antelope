import pytest
import json
import random
import string
from django.urls import reverse
from rest_framework import status

@pytest.fixture
def test_credentials():
    """Fixture to generate random test user credentials"""
    random_string = ''.join(random.choices(string.ascii_lowercase, k=8))
    return {
        'username': f"test_user_{random_string}",
        'password': ''.join(random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=12)),
        'token': 'test-token'
    }

@pytest.mark.django_db
def test_user_lifecycle_success(client, test_credentials):
    """Test successful user lifecycle flow"""
    url = reverse('test_user_lifecycle')
    headers = {'HTTP_AUTHORIZATION': f'Bearer {test_credentials["token"]}'}
    data = {
        'username': test_credentials['username'],
        'password': test_credentials['password']
    }
    
    response = client.post(
        url,
        data=data,
        content_type='application/json',
        **headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    response_data = json.loads(response.content)
    
    assert response_data['message'] == 'User lifecycle test completed successfully'
    assert response_data['details']['signup'] == 'success'
    assert response_data['details']['signin'] == 'success'
    assert response_data['details']['delete'] == 'success'