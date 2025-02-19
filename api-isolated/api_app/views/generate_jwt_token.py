from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import jwt
import time
import logging

logger = logging.getLogger(__name__)

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

@api_view(['GET'])
def get_test_token(request):
    """Simple endpoint that just returns a JWT token"""
    try:
        token = generate_jwt_token()
        return Response({"token": token})
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
