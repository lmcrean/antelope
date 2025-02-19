from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status

@override_settings(DEBUG=False)
class SupabaseHealthProdEndpointTest(TestCase):
    def setUp(self):
        """Set up test environment"""
        self.url = reverse('health_check')

    def test_prod_health_check(self):
        """Test health check endpoint in production environment"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')
        self.assertTrue(response.data['supabase_connected'])

    def test_prod_config_check(self):
        """Test configuration check in production environment"""
        response = self.client.get(self.url)
        self.assertTrue(response.data['supabase_url_configured'])
        self.assertTrue(response.data['supabase_key_configured'])

    def test_prod_error_handling(self):
        """Test error handling in production environment"""
        with self.settings(SUPABASE_URL=''):
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
            self.assertEqual(response.data['status'], 'unhealthy') 