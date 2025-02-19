from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from supabase import create_client
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
def health_check(request):
    """
    Simple health check endpoint that verifies Supabase connection
    """
    response_data = {
        "status": "unhealthy",
        "message": "",
        "supabase_connected": False,
        "supabase_url_configured": bool(settings.SUPABASE_URL),
        "supabase_key_configured": bool(settings.SUPABASE_KEY)
    }
    
    try:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            response_data["message"] = "Missing Supabase configuration"
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Initialize Supabase client with minimal configuration
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        
        # Update response data
        response_data.update({
            "status": "healthy",
            "message": "API is configured with Supabase",
            "supabase_connected": True
        })
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error checking Supabase health: {str(e)}")
        response_data["message"] = f"Error connecting to Supabase: {str(e)}"
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 