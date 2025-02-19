import logging
import jwt
import datetime
from django.conf import settings
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

def generate_jwt_token():
    """Generate a JWT token for testing"""
    payload = {
        'user_id': 'test_user',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'role': 'service_role'
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_test_token(request):
    """Generate a test JWT token"""
    token = generate_jwt_token()
    return Response({'token': token}, status=status.HTTP_200_OK)