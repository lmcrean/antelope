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
from api_app import views
from api_app.views import health_check, create_and_authenticate_user

api_patterns = [
    path('test/', views.APITest.as_view(), name='api-test'),
    path('health/', health_check, name='health_check'),
    path('auth/test/', create_and_authenticate_user, name='jwt_test'),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='api/test/', permanent=False), name='index'),
    path('api/', include(api_patterns)),
]

handler404 = 'api_app.views.custom_error_404'
handler500 = 'api_app.views.custom_error_500'
