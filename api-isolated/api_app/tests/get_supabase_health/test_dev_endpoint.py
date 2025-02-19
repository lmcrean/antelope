import pytest
from django.urls import reverse
from rest_framework import status

@pytest.mark.django_db
def test_dev_health_check(client):
    """Test health check endpoint in dev environment"""
    url = reverse('health_check')
    response = client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['status'] == 'healthy'
    assert data['supabase_connected'] is True

@pytest.mark.django_db
def test_dev_config_check(client):
    """Test configuration check in dev environment"""
    url = reverse('health_check')
    response = client.get(url)
    data = response.json()
    
    assert data['supabase_url_configured'] is True
    assert data['supabase_key_configured'] is True

@pytest.mark.django_db
def test_dev_health_check_method_not_allowed(client):
    """Test that POST is not allowed on health check endpoint"""
    url = reverse('health_check')
    response = client.post(url)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED 