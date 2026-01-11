
import os
import django
import sys
import traceback

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User

def test_login():
    email = "muruli@p.com"
    password = "password123" 
    
    print(f"Checking for user {email}...")
    try:
        user = User.objects.get(email=email)
        print(f"User found: {user}")
    except User.DoesNotExist:
        print("User does not exist. Creating test user...")
        # create_user handles password hashing
        user = User.objects.create_user(email=email, password=password, role='patient', first_name='Test', last_name='User')
        print(f"User created: {user}")
    except Exception as e:
        print(f"Error getting user: {e}")
        traceback.print_exc()
        return

    # Reset password to ensure we know it
    print("Resetting password to 'password123'...")
    user.set_password("password123")
    user.save()

    print("Attempting authenticate()...")
    try:
        # authenticate() expects 'email' key because of EmailBackend but it also accepts kwargs.
        # However, standard authenticate takes (request, ...credentials).
        # Our EmailBackend takes (request, email=None, password=None, **kwargs).
        # So we can pass email as keyword argument.
        auth_user = authenticate(email=email, password="password123")
        if auth_user:
            print(f"Authentication successful: {auth_user}")
        else:
            print("Authentication returned None (invalid credentials)")
    except Exception as e:
        print(f"CRASH in authenticate(): {e}")
        traceback.print_exc()
        return

    if auth_user:
        print("Attempting token generation...")
        try:
            refresh = RefreshToken.for_user(auth_user)
            print(f"Token generation successful. Access: {str(refresh.access_token)}")
        except Exception as e:
            print(f"CRASH in RefreshToken.for_user(): {e}")
            traceback.print_exc()

if __name__ == "__main__":
    test_login()
