from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from ..utils import get_supabase_client
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
        # Initialize Supabase client
        supabase = get_supabase_client()
        
        # Update response data
        response_data.update({
            "status": "healthy",
            "message": "API is configured with Supabase",
            "supabase_connected": True
        })
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        response_data["message"] = f"Error connecting to Supabase: {str(e)}"
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 