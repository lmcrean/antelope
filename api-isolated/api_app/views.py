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

# Create your views here.

class APITest(APIView):
    def get(self, request):
        return JsonResponse({"message": "API is working!"})

def custom_error_404(request, exception):
    return JsonResponse({'error': '404 error, Not Found'}, status=404)

def custom_error_500(request):
    return JsonResponse({'error': '500 error, Internal Server Error'}, status=500)

def generate_random_credentials():
    """Generate random username and password"""
    random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    username = f"Random_{random_string}"
    password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
    email = f"test{random_string.lower()}@example.com"  # Simplified email format
    return username, password, email

@api_view(['POST'])
def create_and_authenticate_user(request):
    """
    Create a new random user and authenticate them using Supabase
    """
    try:
        supabase = get_supabase_client()
        
        # Generate random credentials
        username, password, email = generate_random_credentials()
        
        try:
            # Create new user
            user_response = supabase.auth.sign_up({
                "email": email,
                "password": password
            })
        except Exception as signup_error:
            return Response({
                "error": f"Error during user creation: {str(signup_error)}",
                "details": {
                    "email": email,
                    "error_type": type(signup_error).__name__
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            # Sign in as the new user
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
        except Exception as signin_error:
            return Response({
                "error": f"Error during user authentication: {str(signin_error)}",
                "details": {
                    "email": email,
                    "error_type": type(signin_error).__name__
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "message": [
                f"Success: new user created {username}",
                f"Success: signed in as new user {username}"
            ],
            "user": username,
            "jwt": auth_response.session.access_token
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "error": f"Error during user creation/authentication: {str(e)}",
            "details": {
                "error_type": type(e).__name__
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
        
        # Simple query to verify connection
        response = supabase.auth.get_session()
        
        response_data.update({
            "status": "healthy",
            "message": "API is connected to Supabase",
            "supabase_connected": True
        })
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        response_data["message"] = f"Error connecting to Supabase: {str(e)}"
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
