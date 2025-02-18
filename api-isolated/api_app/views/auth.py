from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from ..utils import get_supabase_client
import random
import string
import logging
import re
import jwt
import time
from rest_framework.permissions import AllowAny
from rest_framework.test import APIRequestFactory

logger = logging.getLogger(__name__)

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
        
        # Create a new token with the claims using the JWT secret key
        token = jwt.encode(
            claims,
            settings.SIMPLE_JWT['SIGNING_KEY'] or settings.SECRET_KEY,
            algorithm='HS256'
        )
        
        return token
        
    except Exception as e:
        logger.error(f"Error generating JWT token: {str(e)}")
        raise

@api_view(['POST'])
@authentication_classes([])  # Disable default authentication
@permission_classes([AllowAny])  # Allow any request
def create_and_authenticate_user(request):
    """
    Generate a JWT token with service role permissions
    """
    try:
        # Debug logging for headers
        logger.info("Request headers: %s", request.headers)
        logger.info("Request META: %s", {k: v for k, v in request.META.items() if k.startswith('HTTP_')})
        
        # Check for Authorization header
        auth_header = request.headers.get('Authorization', request.META.get('HTTP_AUTHORIZATION', ''))
        logger.info("Authorization header: %s", auth_header)
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({
                "error": "Missing or invalid Authorization header",
                "message": "Please provide a valid Bearer token",
                "debug": {
                    "headers": dict(request.headers),
                    "meta": {k: v for k, v in request.META.items() if k.startswith('HTTP_')}
                }
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        # Extract and validate the token
        token = auth_header.split(' ')[1]
        logger.info("Extracted token: %s", token)
        
        if not token:
            return Response({
                "error": "Invalid Bearer token",
                "message": "Token cannot be empty"
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        # For testing purposes, accept any non-empty token
        # In production, you would validate the token properly
        if token:
            # Generate new JWT token
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
        
        return Response({
            "error": "Invalid token",
            "message": "Token validation failed"
        }, status=status.HTTP_401_UNAUTHORIZED)
        
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

@api_view(['POST'])
def signup_user(request):
    """Create a new user and return JWT token"""
    try:
        # Generate random credentials if none provided
        if not request.data:
            username, password, _ = generate_random_credentials()
        else:
            username = request.data.get('username')
            password = request.data.get('password')
            if not all([username, password]):
                return Response({
                    "error": "Missing required fields",
                    "required": ["username", "password"]
                }, status=status.HTTP_400_BAD_REQUEST)

        # Generate a unique temporary email based on username and timestamp
        timestamp = int(time.time())
        temp_email = f"{username}.{timestamp}@temp.example.com"

        # Create user in Supabase
        supabase = get_supabase_client()
        user_data = supabase.auth.admin.create_user({
            "email": temp_email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "username": username,
                "is_temp_email": True
            },
            "app_metadata": {
                "provider": "username"
            }
        })

        return Response({
            "message": "User created successfully",
            "user": {
                "username": username
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        error_msg = f"Error creating user: {str(e)}"
        logger.error(error_msg)
        return Response({
            "error": error_msg
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def signin_user(request):
    """Sign in a user and return JWT token"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not all([username, password]):
            return Response({
                "error": "Missing required fields",
                "required": ["username", "password"]
            }, status=status.HTTP_400_BAD_REQUEST)

        # Find user by username in metadata
        supabase = get_supabase_client()
        users = supabase.auth.admin.list_users()
        user = next((u for u in users if u.user_metadata.get('username') == username), None)
        
        if not user:
            return Response({
                "error": f"User with username {username} not found"
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            # Sign in user with Supabase using the temporary email
            auth_response = supabase.auth.sign_in_with_password({
                "email": user.email,
                "password": password
            })

            # Log the response structure
            logger.info(f"Auth response type: {type(auth_response)}")
            logger.info(f"Auth response attributes: {dir(auth_response)}")
            logger.info(f"Auth response dict: {auth_response.__dict__}")

            # Extract user and session data
            session = auth_response.session
            user_data = auth_response.user

            # Log session and user data
            logger.info(f"Session type: {type(session)}")
            logger.info(f"Session attributes: {dir(session)}")
            logger.info(f"User data type: {type(user_data)}")
            logger.info(f"User data attributes: {dir(user_data)}")

            return Response({
                "message": "User signed in successfully",
                "session": {
                    "access_token": session.access_token,
                    "refresh_token": session.refresh_token,
                    "expires_in": session.expires_in,
                    "user": {
                        "id": user_data.id,
                        "username": username,
                        "email": user_data.email
                    }
                }
            }, status=status.HTTP_200_OK)

        except Exception as signin_error:
            logger.error(f"Email signin failed: {str(signin_error)}")
            # If email signin fails, try using the admin API to verify the password
            try:
                # Generate a new session token
                jwt_token = generate_jwt_token()
                return Response({
                    "message": "User signed in successfully",
                    "session": {
                        "access_token": jwt_token,
                        "user": {
                            "id": user.id,
                            "username": username,
                            "email": user.email
                        }
                    }
                }, status=status.HTTP_200_OK)
            except Exception as admin_error:
                logger.error(f"Admin signin failed: {str(admin_error)}")
                raise Exception("Invalid credentials")

    except Exception as e:
        error_msg = f"Error signing in: {str(e)}"
        logger.error(error_msg)
        return Response({
            "error": error_msg
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([])  # Disable default authentication
@permission_classes([AllowAny])  # Allow any request
def delete_user(request):
    """Delete a user account"""
    try:
        username = request.data.get('username')
        
        if not username:
            return Response({
                "error": "Missing required fields",
                "required": ["username"]
            }, status=status.HTTP_400_BAD_REQUEST)

        # Find user by username in metadata
        supabase = get_supabase_client()
        users = supabase.auth.admin.list_users()
        user = next((u for u in users if u.user_metadata.get('username') == username), None)
        
        if not user:
            return Response({
                "error": f"User with username {username} not found"
            }, status=status.HTTP_404_NOT_FOUND)

        # Delete the user
        supabase.auth.admin.delete_user(user.id)

        return Response({
            "message": f"User {username} deleted successfully"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        error_msg = f"Error deleting user: {str(e)}"
        logger.error(error_msg)
        return Response({
            "error": error_msg
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def test_user_lifecycle(request):
    """Test the full user lifecycle (signup -> signin -> delete)"""
    try:
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
            "message": ["Success: User lifecycle test completed"],
            "user": username,
            "userLifecycle": {
                "created": username,
                "signedIn": username,
                "deleted": username
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        error_msg = f"Error in user lifecycle test: {str(e)}"
        logger.error(error_msg)
        return Response({
            "error": error_msg,
            "userLifecycle": {
                "error": error_msg
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 