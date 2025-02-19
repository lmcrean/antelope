import requests
import logging
import json

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# API Configuration
API_BASE_URL = "http://localhost:8000/api"

def test_basic_api():
    """Test basic API message endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/test/")
        logger.info(f"API Test Response Status: {response.status_code}")
        logger.info(f"API Test Response Body: {response.text}")
        return response.json() if response.ok else None
    except Exception as e:
        logger.error(f"Error in API test: {str(e)}")
        return None

def test_health():
    """Test Supabase health check endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/health/")
        logger.info(f"Health Check Response Status: {response.status_code}")
        logger.info(f"Health Check Response Body: {response.text}")
        return response.json() if response.ok else None
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        return None

def test_jwt():
    """Test JWT token generation endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/auth/token/")
        logger.info(f"JWT Test Response Status: {response.status_code}")
        logger.info(f"JWT Test Response Body: {response.text}")
        return response.json() if response.ok else None
    except Exception as e:
        logger.error(f"Error in JWT test: {str(e)}")
        return None

def test_user_lifecycle():
    """Test user lifecycle endpoint"""
    try:
        # For the lifecycle test, we need to include a test token
        headers = {'Authorization': 'Bearer test-token'}
        response = requests.post(
            f"{API_BASE_URL}/auth/test/",
            headers=headers
        )
        logger.info(f"User Lifecycle Response Status: {response.status_code}")
        logger.info(f"User Lifecycle Response Body: {response.text}")
        return response.json() if response.ok else None
    except Exception as e:
        logger.error(f"Error in user lifecycle test: {str(e)}")
        return None

def run_all_tests():
    """Run all API tests"""
    logger.info("Starting API Tests")
    
    # Test basic API
    logger.info("\n=== Testing Basic API ===")
    basic_result = test_basic_api()
    if not basic_result:
        logger.error("Basic API test failed")
    
    # Test Health Check
    logger.info("\n=== Testing Health Check ===")
    health_result = test_health()
    if not health_result:
        logger.error("Health check failed")
    
    # Test JWT
    logger.info("\n=== Testing JWT Token ===")
    jwt_result = test_jwt()
    if not jwt_result:
        logger.error("JWT test failed")
    
    # Test User Lifecycle
    logger.info("\n=== Testing User Lifecycle ===")
    lifecycle_result = test_user_lifecycle()
    if not lifecycle_result:
        logger.error("User lifecycle test failed")

if __name__ == "__main__":
    run_all_tests() 