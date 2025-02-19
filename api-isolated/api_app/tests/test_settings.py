import os

# Set DEBUG environment variable before importing settings
os.environ['DJANGO_DEBUG'] = 'True'

from api_project.settings import *

# Use in-memory SQLite database for tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Keep the ROOT_URLCONF from the main settings
ROOT_URLCONF = 'api_project.urls'

# Set test secrets
SECRET_KEY = 'test-secret-key'
JWT_SECRET = SECRET_KEY

# Configure logging for tests
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
    'loggers': {
        'api_app': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
} 