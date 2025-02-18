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
    path('test/', APITest.as_view(), name='api-test'),
    path('auth/signup/', signup_user, name='signup'),
    path('auth/signin/', signin_user, name='signin'),
    path('auth/delete/', delete_user, name='delete'),
    path('auth/jwt/', create_and_authenticate_user, name='jwt'),
    path('health/', health_check, name='health'),
    path('auth/test/', test_user_lifecycle, name='test-lifecycle')
] 