from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .utils import get_supabase_client
from django.conf import settings
import random
import string
import logging
import re
import jwt
import time

logger = logging.getLogger(__name__)

# Create your views here.

class APITest(APIView):
    def get(self, request):
        return JsonResponse({"message": "API is working!"})

def custom_error_404(request, exception):
    return JsonResponse({'error': '404 error, Not Found'}, status=404)

def custom_error_500(request):
    return JsonResponse({'error': '500 error, Internal Server Error'}, status=500)

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def generate_random_credentials():
    """Generate random username and password"""
    random_string = ''.join(random.choices(string.ascii_lowercase, k=8))  # Only lowercase letters
    username = f"Random_{random_string}"
    password = ''.join(random.choices(string.ascii_letters + string.digits + "!@#$%^&*", k=12))
    email = f"test.{random_string}@gmail.com"  # Using a real domain
    
    if not is_valid_email(email):
        raise ValueError(f"Generated invalid email: {email}")
    
    return username, password, email

def generate_jwt_token():
    """Generate a JWT token with service role claims"""
    try:
        # Create claims for the service role token
        claims = {
            "iss": "supabase",
            "sub": "service_role",
            "iat": int(time.time()),
            "exp": int(time.time()) + 3600,  # 1 hour expiry
            "role": "service_role"
        }
        
        # Create a new token with the claims using the Supabase key as the secret
        token = jwt.encode(
            claims,
            settings.SUPABASE_KEY,
            algorithm='HS256'
        )
        
        return token
        
    except Exception as e:
        logger.error(f"Error generating JWT token: {str(e)}")
        raise

@api_view(['POST'])
def create_and_authenticate_user(request):
    """
    Generate a JWT token with service role permissions
    """
    try:
        # Generate JWT token
        jwt_token = generate_jwt_token()
        logger.info("Generated JWT token successfully")
        
        return Response({
            "message": [
                "Success: generated JWT token",
                "Success: token has service role permissions"
            ],
            "user": "service_role",
            "jwt": jwt_token
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        error_msg = f"Error generating JWT token: {str(e)}"
        logger.error(error_msg)
        return Response({
            "error": error_msg,
            "details": {
                "error_type": type(e).__name__,
                "error_str": str(e)
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
