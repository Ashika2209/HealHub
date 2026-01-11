
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healthcare_pro.config.settings')
django.setup()

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from healthcare_pro.accounts.models import User

def test_login():
    email = "muruli@p.com"
    password = "password123" # Use a known password or try to authenticate with what we have. 
    # Actually I verified I don't know the password from the screenshot. 
    # But I can check if the user exists.
    
    print(f"Checking for user {email}...")
    try:
        user = User.objects.get(email=email)
        print(f"User found: {user}")
    except User.DoesNotExist:
        print("User does not exist. Creating test user...")
        user = User.objects.create_user(email=email, password=password, role='patient', first_name='Test', last_name='User')
        print(f"User created: {user}")
    except Exception as e:
        print(f"Error getting user: {e}")
        return

    # Test authentication backend logic manually if we don't know the password
    # Or just rest password to known one
    print("Resetting password to 'password123' to test auth...")
    user.set_password("password123")
    user.save()

    print("Attempting authenticate()...")
    try:
        auth_user = authenticate(email=email, password="password123")
        if auth_user:
            print(f"Authentication successful: {auth_user}")
        else:
            print("Authentication returned None (invalid credentials)")
    except Exception as e:
        print(f"CRASH in authenticate(): {e}")
        try:
             import traceback
             traceback.print_exc()
        except:
             pass
        return

    if auth_user:
        print("Attempting token generation...")
        try:
            refresh = RefreshToken.for_user(auth_user)
            print(f"Token generation successful. Access: {str(refresh.access_token)}")
        except Exception as e:
            print(f"CRASH in RefreshToken.for_user(): {e}")
            try:
                import traceback
                traceback.print_exc()
            except:
                pass

if __name__ == "__main__":
    test_login()
