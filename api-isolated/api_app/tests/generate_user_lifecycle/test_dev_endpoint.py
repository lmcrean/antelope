from django.test import TestCase
from django.urls import reverse
from rest_framework import status

class UserLifecycleDevEndpointTest(TestCase):
    def setUp(self):
        """Set up test environment"""
        self.url = reverse('test_user_lifecycle')
        self.test_token = 'test-token'

    def test_dev_user_lifecycle(self):
        """Test user lifecycle in dev environment"""
        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.test_token}'}
        response = self.client.post(self.url, **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'User lifecycle test completed successfully')
        self.assertEqual(response.data['details']['signup'], 'success')
        self.assertEqual(response.data['details']['signin'], 'success')
        self.assertEqual(response.data['details']['delete'], 'success')

    def test_dev_missing_token(self):
        """Test user lifecycle without token in dev environment"""
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) 