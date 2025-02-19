from django.conf import settings
from supabase import create_client, Client
import logging
import os
import httpx

logger = logging.getLogger(__name__)

def get_supabase_client() -> Client:
    """
    Initialize and return a Supabase client instance.
    Uses settings from Django configuration.
    """
    try:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            error_msg = "Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_KEY in settings."
            logger.error(error_msg)
            raise ValueError(error_msg)
            
        # Create client with positional arguments
        # Disable proxy settings by using environment variables
        original_proxy_vars = {
            'http_proxy': os.environ.get('http_proxy'),
            'https_proxy': os.environ.get('https_proxy'),
            'HTTP_PROXY': os.environ.get('HTTP_PROXY'),
            'HTTPS_PROXY': os.environ.get('HTTPS_PROXY'),
        }
        
        # Temporarily unset proxy variables
        for var in original_proxy_vars:
            if var in os.environ:
                del os.environ[var]
        
        try:
            client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.debug(f"Successfully initialized Supabase client with URL: {settings.SUPABASE_URL}")
            return client
        finally:
            # Restore original proxy variables
            for var, value in original_proxy_vars.items():
                if value is not None:
                    os.environ[var] = value
        
    except Exception as e:
        error_msg = f"Error initializing Supabase client: {str(e)}"
        logger.error(error_msg)
        raise 