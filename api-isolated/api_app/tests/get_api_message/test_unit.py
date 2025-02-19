import pytest
import requests
from django.urls import reverse
from rest_framework import status
from api_app.views.generate_jwt_token import generate_jwt_token

@pytest.mark.django_db
def test_basic_api(client):
    """Test basic API endpoint"""
    url = reverse('api-test')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert 'message' in response.json()

@pytest.mark.django_db
def test_health(client):
    """Test Supabase health check endpoint"""
    url = reverse('health_check')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert 'status' in response.json()
    assert response.json()['status'] == 'healthy'

@pytest.mark.django_db
def test_jwt(client):
    """Test JWT token generation"""
    url = reverse('get_test_token')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert 'token' in response.json()

@pytest.mark.django_db
def test_user_lifecycle(client):
    """Test user lifecycle endpoint"""
    url = reverse('test_user_lifecycle')
    token = generate_jwt_token()
    headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
    data = {
        'username': 'test_user',
        'password': 'test_password'
    }
    response = client.post(url, data=data, content_type='application/json', **headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()['message'] == 'User lifecycle test completed successfully'

def run_all_tests():
    """Run all API tests"""
    print("Starting API Tests")
    
    # Test basic API
    print("\n=== Testing Basic API ===")
    test_basic_api()
    
    # Test Health Check
    print("\n=== Testing Health Check ===")
    test_health()
    
    # Test JWT
    print("\n=== Testing JWT Token ===")
    test_jwt()
    
    # Test User Lifecycle
    print("\n=== Testing User Lifecycle ===")
    test_user_lifecycle()

if __name__ == "__main__":
    run_all_tests() 