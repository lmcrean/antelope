# API Endpoints

PROD URL: https://antelope-api-isolate-8beb50b26a2a.herokuapp.com/

| endpoint | req | expected response | Pass/Fail | Notes |
|----------|-----|-------------------|-----------|-------|
| / | GET | {"message": "API is working!"} | PASS | Working correctly |
| /test/ | GET | {"message": "API is working!"} | PASS | Working correctly |
| /health/ | GET | Health status with Supabase connection | FAIL | 500 Error - Supabase client initialization error: Client.__init__() got an unexpected keyword argument 'proxy' |
| /auth/jwt/test/ | POST | JWT token with service role permissions | FAIL | 500 Error - Missing SIMPLE_JWT configuration: 'Settings' object has no attribute 'SIMPLE_JWT' |
| /auth/signup/ | POST | User creation confirmation | FAIL | 500 Error - Supabase client initialization error: Client.__init__() got an unexpected keyword argument 'proxy' |
| /auth/signin/ | POST | Session token and user info | FAIL | 500 Error - Supabase client initialization error: Client.__init__() got an unexpected keyword argument 'proxy' |
| /auth/delete/ | DELETE | User deletion confirmation | FAIL | 500 Error - Supabase client initialization error: Client.__init__() got an unexpected keyword argument 'proxy' |
| /auth/test/ | POST | User lifecycle test results | FAIL | 500 Error - Supabase client initialization error: Client.__init__() got an unexpected keyword argument 'proxy' |

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

# simple testing in the CLI

```
curl.exe -i https://antelope-api-isolate-8beb50b26a2a.herokuapp.com/api/health/
```

```
curl.exe -i https://antelope-api-isolate-8beb50b26a2a.herokuapp.com/api/test/
```

