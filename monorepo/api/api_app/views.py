from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .utils import get_supabase_client
from django.conf import settings

# Create your views here.

class APITest(APIView):
    def get(self, request):
        return JsonResponse({"message": "API is working!"})

def custom_error_404(request, exception):
    return JsonResponse({'error': '404 error, Not Found'}, status=404)

def custom_error_500(request):
    return JsonResponse({'error': '500 error, Internal Server Error'}, status=500)

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
        
        # Simple query to verify connection
        response = supabase.auth.get_session()
        
        response_data.update({
            "status": "healthy",
            "message": "API is connected to Supabase",
            "supabase_connected": True
        })
        return JsonResponse(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        response_data["message"] = f"Error connecting to Supabase: {str(e)}"
        return JsonResponse(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
