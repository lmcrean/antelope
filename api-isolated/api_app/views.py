from django.http import JsonResponse
from django.conf import settings
import os

def test_supabase_config(request):
    """Test view to check Supabase configuration"""
    config = {
        'supabase_url': settings.SUPABASE_URL,
        'has_key': bool(settings.SUPABASE_KEY),
        'has_jwt_secret': bool(settings.SUPABASE_JWT_SECRET),
        'has_anon_key': bool(os.getenv('SUPABASE_ANON_KEY')),
        'env_file_loaded': bool(os.getenv('DJANGO_SECRET_KEY')),
    }
    return JsonResponse(config) 