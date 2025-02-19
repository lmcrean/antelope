import pytest
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from .test_supabase_health import mock_supabase

# skip this test for now
@pytest.mark.skip(reason="Skipping production endpoint test")
@override_settings(DEBUG=False)
class SupabaseHealthProdEndpointTest(TestCase):
    def setUp(self):
        """Set up test environment"""
        self.url = reverse('health_check')

    @pytest.fixture(autouse=True)
    def _mock_supabase(self, mock_supabase):
        """Automatically use mock_supabase for all tests"""
        self.mock_supabase = mock_supabase

    def test_prod_health_check(self):
        """Test health check endpoint in production environment"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('supabase_config', data)

    def test_prod_config_check(self):
        """Test configuration check in production environment"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('supabase_config', data)
        self.assertTrue(data['supabase_config']['is_configured'])

    def test_prod_error_handling(self):
        """Test error handling in production environment"""
        # Simulate Supabase configuration error
        with override_settings(SUPABASE_URL=None, SUPABASE_KEY=None):
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
            data = response.json()
            self.assertEqual(data['status'], 'error')
            self.assertIn('error', data) 