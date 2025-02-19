from django.urls import path
from .views import (
    APITest,
    signup_user,
    signin_user,
    delete_user,
    create_and_authenticate_user,
    health_check,
    test_user_lifecycle
)

urlpatterns = [
    # 1. Supabase Test
    path('', APITest.as_view(), name='index'),
    path('test/', APITest.as_view(), name='api-test'),
    path('health/', health_check, name='health_check'),

    # 2. JWT Test
    path('auth/jwt/test/', create_and_authenticate_user, name='jwt_test'),

    # 3. User lifecycle Test
    path('auth/signup/', signup_user, name='signup'),
    path('auth/signin/', signin_user, name='signin'),
    path('auth/delete/', delete_user, name='delete_user'),
    path('auth/test/', test_user_lifecycle, name='test_user_lifecycle'),
] 