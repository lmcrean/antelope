import os
import subprocess
import time
import pytest
from typing import Generator

@pytest.fixture(scope="session")
def dev_server() -> Generator[str, None, None]:
    """Fixture to start and stop the development server.
    
    Returns:
        str: The base URL of the development server (e.g., "http://localhost:8000")
        
    Usage:
        @pytest.mark.dev_endpoint
        def test_my_endpoint(dev_server):
            response = requests.get(f"{dev_server}/api/my-endpoint/")
            assert response.status_code == 200
    """
    # Get the absolute path to the api-isolated directory
    current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    
    # Start the server
    server = subprocess.Popen(
        ["python", "manage.py", "runserver", "--noreload"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=current_dir
    )
    
    # Wait for server to start
    time.sleep(2)
    
    try:
        yield "http://localhost:8000"
    finally:
        # Cleanup: stop the server (even if test fails)
        server.terminate()
        server.wait() 