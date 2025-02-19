from django.test import TestCase
from django.urls import reverse
from rest_framework import status

class SupabaseHealthDevEndpointTest(TestCase):
    def setUp(self):
        """Set up test environment"""
        self.url = reverse('health_check')

    def test_dev_health_check(self):
        """Test health check endpoint in dev environment"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')
        self.assertTrue(response.data['supabase_connected'])

    def test_dev_config_check(self):
        """Test configuration check in dev environment"""
        response = self.client.get(self.url)
        self.assertTrue(response.data['supabase_url_configured'])
        self.assertTrue(response.data['supabase_key_configured']) 