from django.conf import settings
from supabase import create_client, Client
import os

def get_supabase_client() -> Client:
    """
    Initialize and return a Supabase client instance.
    Uses settings from Django configuration.
    """
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    
    # If we're in test mode, configure the client to skip email confirmations
    if os.environ.get('DJANGO_SETTINGS_MODULE') == 'api_project.settings':
        client.auth.config.update({
            'enable_confirmations': False
        })
    
    return client 