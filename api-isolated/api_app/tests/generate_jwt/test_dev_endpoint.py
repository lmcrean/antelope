import pytest
import re
import requests
import subprocess
import time
import os
from django.urls import reverse
from rest_framework import status

pytestmark = [pytest.mark.jwt, pytest.mark.integration]

@pytest.fixture(scope="session")
def dev_server():
    """Fixture to start and stop the development server"""
    # Get the absolute path to the api-isolated directory
    current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    
    # Start the server
    server = subprocess.Popen(
        ["python", "manage.py", "runserver", "--noreload"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=current_dir  # Use the absolute path
    )
    
    # Wait for server to start
    time.sleep(2)
    
    yield "http://localhost:8000"
    
    # Cleanup: stop the server
    server.terminate()
    server.wait()

def test_dev_server_jwt_endpoint(dev_server):
    """Test JWT endpoint is accessible on development server"""
    # Get the endpoint path
    jwt_path = reverse('get_test_token').lstrip('/')
    full_url = f"{dev_server}/{jwt_path}"
    
    # Test token generation
    response = requests.get(full_url)
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert 'token' in data
    assert data['token']
    assert len(data['token']) > 0
    
    # Verify JWT token format
    assert re.match(r"^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$", data['token']) 