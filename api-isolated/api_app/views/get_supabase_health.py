from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests
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

        # Just check if we can reach the Supabase URL
        headers = {"apikey": settings.SUPABASE_KEY}
        requests.get(f"{settings.SUPABASE_URL}/rest/v1/", headers=headers, timeout=5)
        
        # If we got here, the connection is working
        response_data.update({
            "status": "healthy",
            "message": "API is configured with Supabase",
            "supabase_connected": True
        })
        return Response(response_data)
        
    except requests.RequestException as e:
        logger.error(f"Error checking Supabase health: {str(e)}")
        response_data["message"] = f"Error connecting to Supabase: {str(e)}"
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 