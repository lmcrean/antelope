from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status

@override_settings(DEBUG=False)
class UserLifecycleProdEndpointTest(TestCase):
    def setUp(self):
        """Set up test environment"""
        self.url = reverse('test_user_lifecycle')
        # Get a real JWT token for production tests
        token_response = self.client.get(reverse('get_test_token'))
        self.token = token_response.data['token']

    def test_prod_user_lifecycle(self):
        """Test user lifecycle in production environment"""
        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}
        response = self.client.post(self.url, **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'User lifecycle test completed successfully')
        self.assertEqual(response.data['details']['signup'], 'success')
        self.assertEqual(response.data['details']['signin'], 'success')
        self.assertEqual(response.data['details']['delete'], 'success')

    def test_prod_invalid_token(self):
        """Test user lifecycle with invalid token in production environment"""
        headers = {'HTTP_AUTHORIZATION': 'Bearer invalid-token'}
        response = self.client.post(self.url, **headers)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_prod_missing_token(self):
        """Test user lifecycle without token in production environment"""
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) 