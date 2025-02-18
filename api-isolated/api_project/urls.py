"""
URL configuration for api_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from api_app.views import (
    APITest,
    health_check,
    create_and_authenticate_user,
    signup_user,
    signin_user,
    delete_user,
    custom_error_404,
    custom_error_500,
    test_user_lifecycle
)

api_patterns = [
    path('test/', APITest.as_view(), name='api-test'),
    path('health/', health_check, name='health_check'),
    path('auth/jwt/test/', create_and_authenticate_user, name='jwt_test'),
    path('auth/signup/', signup_user, name='signup'),
    path('auth/signin/', signin_user, name='signin'),
    path('auth/delete/', delete_user, name='delete_user'),
    path('auth/test/', test_user_lifecycle, name='test_user_lifecycle'),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='api/test/', permanent=False), name='index'),
    path('api/', include(api_patterns)),
]

handler404 = 'api_app.views.custom_error_404'
handler500 = 'api_app.views.custom_error_500'
