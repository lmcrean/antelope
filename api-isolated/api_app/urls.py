from django.urls import path
from .views import (
    APITest,
    health_check,
    test_user_lifecycle,
    get_test_token
)

urlpatterns = [
    # 1. Basic API Message Test
    path('', APITest.as_view(), name='index'),
    path('test/', APITest.as_view(), name='api-test'),

    # 2. Supabase Test - check if the supabase is connected
    path('health/', health_check, name='health_check'),

    # 3. Simple JWT token generation
    path('auth/token/', get_test_token, name='get_test_token'),

    # 4. User lifecycle Test - full test including auth
    path('auth/test/', test_user_lifecycle, name='test_user_lifecycle'),
] 