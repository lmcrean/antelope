# API Endpoints

PROD URL: https://antelope-api-isolate.herokuapp.com/

| endpoint | req | expected response | Pass/Fail | Notes |
|----------|-----|-------------------|-----------|-------|
| / | GET | "API is healthy" | PASS |  |
| /test/ | GET | "API is healthy" | PASS |  |
| /health/ | GET | "API is healthy" |  |  |
| /auth/jwt/test/ | GET | "API is healthy" |  |  |
| /auth/signup/ | POST | "API is healthy" |  |  |
| /auth/signin/ | POST | "API is healthy" |  |  |
| /auth/delete/ | POST | "API is healthy" |  |  |
| /auth/test/ | POST | "API is healthy" |  |  |

```PYTHON
urlpatterns = [
    path('', APITest.as_view(), name='index'),
    path('test/', APITest.as_view(), name='api-test'),
    path('health/', health_check, name='health_check'),
    path('auth/jwt/test/', create_and_authenticate_user, name='jwt_test'),
    path('auth/signup/', signup_user, name='signup'),
    path('auth/signin/', signin_user, name='signin'),
    path('auth/delete/', delete_user, name='delete_user'),
    path('auth/test/', test_user_lifecycle, name='test_user_lifecycle'),
] 
```

