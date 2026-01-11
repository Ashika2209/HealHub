import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

def create_owner():
    email = "owner@healthcarepro.com"
    password = "ownerpassword123"
    
    if User.objects.filter(email=email).exists():
        print(f"Owner user with email {email} already exists.")
        return

    try:
        user = User.objects.create_superuser(
            email=email,
            password=password,
            first_name="Hospital",
            last_name="Owner",
            role='owner'
        )
        print("✅ Owner superuser created successfully!")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Role: owner")
    except Exception as e:
        print(f"❌ Failed to create owner user: {e}")

if __name__ == "__main__":
    create_owner()
