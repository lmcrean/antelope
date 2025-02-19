from django.conf import settings
from supabase import create_client, Client

def get_supabase_client() -> Client:
    """
    Initialize and return a Supabase client instance.
    Uses settings from Django configuration.
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY) 