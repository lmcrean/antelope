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
def test_user_lifecycle(client, test_credentials):
    """Test complete user lifecycle in a single request"""
    url = reverse('test_user_lifecycle')
    headers = {'HTTP_AUTHORIZATION': f'Bearer {test_credentials["token"]}'}
    data = {
        'username': test_credentials['username'],
        'password': test_credentials['password']
    }
    
    response = client.post(
        url,
        data=json.dumps(data),
        content_type='application/json',
        **headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    response_data = json.loads(response.content)
    
    assert response_data['message'] == 'User lifecycle test completed successfully'
    assert response_data['details']['signup'] == 'success'
    assert response_data['details']['signin'] == 'success'
    assert response_data['details']['delete'] == 'success'

@pytest.mark.django_db
def test_missing_token(client, test_credentials):
    """Test request without authorization token"""
    url = reverse('test_user_lifecycle')
    data = {
        'username': test_credentials['username'],
        'password': test_credentials['password']
    }
    
    response = client.post(
        url,
        data=json.dumps(data),
        content_type='application/json'
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert 'Missing or invalid Authorization header' in json.loads(response.content)['error']

@pytest.mark.django_db
def test_invalid_token(client, test_credentials):
    """Test request with invalid authorization token"""
    url = reverse('test_user_lifecycle')
    headers = {'HTTP_AUTHORIZATION': 'Bearer invalid-token'}
    data = {
        'username': test_credentials['username'],
        'password': test_credentials['password']
    }
    
    response = client.post(
        url,
        data=json.dumps(data),
        content_type='application/json',
        **headers
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert 'Invalid token' in json.loads(response.content)['error']

@pytest.mark.django_db
def test_missing_credentials(client, test_credentials):
    """Test request without username or password"""
    url = reverse('test_user_lifecycle')
    headers = {'HTTP_AUTHORIZATION': f'Bearer {test_credentials["token"]}'}
    
    # Test missing username
    response = client.post(
        url,
        data=json.dumps({'password': test_credentials['password']}),
        content_type='application/json',
        **headers
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'Missing credentials' in json.loads(response.content)['error']
    
    # Test missing password
    response = client.post(
        url,
        data=json.dumps({'username': test_credentials['username']}),
        content_type='application/json',
        **headers
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'Missing credentials' in json.loads(response.content)['error'] 