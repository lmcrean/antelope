import pytest
import json
import re
from django.urls import reverse
from rest_framework import status
from django.test.utils import override_settings

pytestmark = pytest.mark.jwt

@override_settings(
    JWT_SECRET='test-secret-key-for-jwt-generation',
    STORAGES={
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }
)
def test_jwt_token_format(client):
    """Test JWT token generation returns correctly formatted token"""
    url = reverse('get_test_token')
    response = client.get(url)
    
    # Check response format
    assert response.status_code == status.HTTP_200_OK
    data = json.loads(response.content)
    assert 'token' in data
    
    # Validate token structure (just check format, not actual validation)
    token = data['token']
    assert token and len(token) > 0
    assert re.match(r"^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$", token)
