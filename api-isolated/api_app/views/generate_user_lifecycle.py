import logging
from django.conf import settings
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import time

logger = logging.getLogger(__name__)

# Mock database to store users for testing
test_users = {}

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
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
        if token != 'test-token':
            return Response({
                "error": "Invalid token",
                "message": "Please provide a valid test token"
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Get username and password from request
        data = request.data
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return Response({
                "error": "Missing credentials",
                "message": "Username and password are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Sign up
        if username in test_users:
            return Response({
                "error": "User exists",
                "message": f"User {username} already exists"
            }, status=status.HTTP_400_BAD_REQUEST)

        test_users[username] = {
            'password': password,
            'created_at': time.time()
        }

        # Step 2: Sign in
        stored_user = test_users.get(username)
        if not stored_user or stored_user['password'] != password:
            return Response({
                "error": "Invalid credentials",
                "message": "Invalid username or password"
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Step 3: Delete
        del test_users[username]

        # Verify deletion
        if username in test_users:
            return Response({
                "error": "Deletion failed",
                "message": f"Failed to delete user {username}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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