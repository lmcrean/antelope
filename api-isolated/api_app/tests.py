import unittest
import requests

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.prod_url = "https://team5-api-eu-5d24fa110c36.herokuapp.com"
        self.dev_url = "http://127.0.0.1:8000"
    
    def test_dev_api_is_working_endpoint(self):
        """Test that the development /test endpoint returns API is working"""
        response = requests.get(f"{self.dev_url}/test/")
        print(f"\nDevelopment Test:")
        print(f"Status Code: {response.status_code}")
        print(f"Response Content: {response.text}")
        print(f"Response Headers: {response.headers}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "API is working!")

    @unittest.skip("Skipping deployed API test while focusing on development")
    def test_prod_api_is_working_endpoint(self):
        """Test that the deployed /test endpoint returns API is working"""
        response = requests.get(f"{self.prod_url}/test/")
        print(f"\nProduction Test:")
        print(f"Status Code: {response.status_code}")
        print(f"Response Content: {response.text}")
        print(f"Response Headers: {response.headers}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "API is working!")

if __name__ == '__main__':
    unittest.main()
