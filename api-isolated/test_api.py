import requests
import logging
import json

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# API Configuration
API_BASE_URL = "http://localhost:8000/api"
TEST_USER = {
    "username": "testuser123",
    "password": "TestPass123!"
}

def test_signup():
    """Test user signup endpoint"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/signup/",
            json=TEST_USER
        )
        logger.info(f"Signup Response Status: {response.status_code}")
        logger.info(f"Signup Response Body: {response.text}")
        return response.json() if response.ok else None
    except Exception as e:
        logger.error(f"Error in signup: {str(e)}")
        return None

def test_signin():
    """Test user signin endpoint"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/signin/",
            json=TEST_USER
        )
        logger.info(f"Signin Response Status: {response.status_code}")
        logger.info(f"Signin Response Body: {response.text}")
        return response.json() if response.ok else None
    except Exception as e:
        logger.error(f"Error in signin: {str(e)}")
        return None

def test_delete():
    """Test user delete endpoint"""
    try:
        response = requests.delete(
            f"{API_BASE_URL}/auth/delete/",
            json={"username": TEST_USER["username"]}
        )
        logger.info(f"Delete Response Status: {response.status_code}")
        logger.info(f"Delete Response Body: {response.text}")
        return response.json() if response.ok else None
    except Exception as e:
        logger.error(f"Error in delete: {str(e)}")
        return None

def run_lifecycle_test():
    """Run the complete user lifecycle test"""
    logger.info("Starting User Lifecycle Test")
    
    # Test Signup
    logger.info("\n=== Testing Signup ===")
    signup_result = test_signup()
    if not signup_result:
        logger.error("Signup failed, stopping test")
        return
    
    # Test Signin
    logger.info("\n=== Testing Signin ===")
    signin_result = test_signin()
    if not signin_result:
        logger.error("Signin failed")
    
    # Test Delete
    logger.info("\n=== Testing Delete ===")
    delete_result = test_delete()
    if not delete_result:
        logger.error("Delete failed")

if __name__ == "__main__":
    run_lifecycle_test() 