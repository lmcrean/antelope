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
        
        # Initialize with minimal configuration
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        
        logger.debug(f"Successfully initialized Supabase client with URL: {settings.SUPABASE_URL}")
        return supabase
        
    except Exception as e:
        error_msg = f"Error initializing Supabase client: {str(e)}"
        logger.error(error_msg)
        raise 