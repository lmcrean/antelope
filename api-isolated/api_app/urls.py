from django.urls import path
from .views import (
    APITest,
    create_and_authenticate_user,
    health_check,
    test_user_lifecycle
)

urlpatterns = [
    # 1. Basic API Message Test
    path('', APITest.as_view(), name='index'),
    path('test/', APITest.as_view(), name='api-test'),

    # 2. Supabase Test - check if the supabase is connected
    path('health/', health_check, name='health_check'),

    # 3. JWT Test - generate JWT token that can be accessed by the test button
    path('auth/jwt/test/', create_and_authenticate_user, name='jwt_test'),

    # 4. User lifecycle Test - generate random user and delete it
    path('auth/test/', test_user_lifecycle, name='test_user_lifecycle'),
] 