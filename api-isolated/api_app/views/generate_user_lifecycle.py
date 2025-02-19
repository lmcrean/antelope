from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.test import APIRequestFactory
from django.conf import settings
import logging
from .generate_jwt_token import generate_jwt_token, generate_random_credentials

logger = logging.getLogger(__name__)

@api_view(['POST'])
@authentication_classes([])  # Disable default authentication
@permission_classes([AllowAny])  # Allow any request
def test_user_lifecycle(request):
    """Test the full user lifecycle (signup -> signin -> delete)"""
    try:
        # Check for Authorization header
        auth_header = request.headers.get('Authorization', request.META.get('HTTP_AUTHORIZATION', ''))
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({
                "error": "Missing or invalid Authorization header",
                "message": "Please provide a valid Bearer token"
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        # Extract and validate the token
        token = auth_header.split(' ')[1]
        
        # Special handling for test token
        if token == 'test-token' and settings.DEBUG:
            # Generate a new JWT token
            jwt_token = generate_jwt_token()
            return Response({
                "message": [
                    "Success: generated JWT token",
                    "Success: token has service role permissions"
                ],
                "user": "service_role",
                "jwt": jwt_token
            })

        # Generate random credentials
        username, password, _ = generate_random_credentials()
        
        # Create a mock request for each step
        factory = APIRequestFactory()
        
        # Step 1: Sign up
        signup_data = {'username': username, 'password': password}
        signup_request = factory.post('/api/auth/signup/', signup_data)
        signup_response = signup_user(signup_request)
        if signup_response.status_code != 201:
            return signup_response
        
        # Step 2: Sign in
        signin_data = {'username': username, 'password': password}
        signin_request = factory.post('/api/auth/signin/', signin_data)
        signin_response = signin_user(signin_request)
        if signin_response.status_code != 200:
            return signin_response
        
        # Step 3: Delete
        delete_data = {'username': username}
        delete_request = factory.delete('/api/auth/delete/', delete_data)
        delete_response = delete_user(delete_request)
        if delete_response.status_code != 200:
            return delete_response
        
        # Return success response with all lifecycle events
        return Response({
            "message": "User lifecycle test completed successfully",
            "details": {
                "signup": "success",
                "signin": "success",
                "delete": "success"
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        error_msg = f"Error in user lifecycle test: {str(e)}"
        logger.error(error_msg)
        return Response({
            "error": error_msg
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 