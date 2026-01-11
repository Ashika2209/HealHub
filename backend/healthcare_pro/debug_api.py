import os
import django
import json
from django.test import RequestFactory, Client
from django.contrib.auth import get_user_model

from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Enable DEBUG to see tracebacks
settings.DEBUG = True
settings.ALLOWED_HOSTS = ['*']

User = get_user_model()

def test_admin_api():
    with open('debug_results.txt', 'w', encoding='utf-8') as f:
        f.write("Testing Admin APIs for 500 errors...\n")
        
        # Create or get an admin user
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                email='admin_debug@example.com',
                password='password123',
                first_name='Admin',
                last_name='Debug'
            )
            admin_user.role = 'admin'
            admin_user.save()
            f.write(f"Created temporary admin user: {admin_user.email}\n")
        else:
            f.write(f"Using existing admin user: {admin_user.email}\n")

        client = Client()
        client.force_login(admin_user)

        endpoints = [
            '/api/accounts/admin/doctors/list/',
            '/api/accounts/admin/patients/list/',
            '/api/accounts/admin/dashboard/stats/',
            '/api/appointments/admin/appointments/',
        ]

        for url in endpoints:
            f.write(f"\nChecking: {url}\n")
            try:
                import logging
                logging.getLogger('django.request').setLevel(logging.ERROR)
                
                response = client.get(url)
                f.write(f"Status: {response.status_code}\n")
                if response.status_code == 500:
                    f.write("ERROR: Internal Server Error detected!\n")
                    content = response.content.decode('utf-8')
                    if '<h1>' in content:
                        import re
                        match = re.search(r'<h1>(.*?)</h1>', content)
                        if match:
                            f.write(f"Error Title: {match.group(1)}\n")
                    
                    if 'Traceback' in content:
                        f.write("Found Traceback in HTML.\n")
                        parts = content.split('Traceback')
                        if len(parts) > 1:
                            f.write("Traceback (partial): ...\n")
                            f.write(parts[-1][:2000]) # More context
                elif response.status_code != 200:
                    f.write(f"Unexpected status: {response.content.decode('utf-8')[:500]}\n")
            except Exception as e:
                f.write(f"CRASH during client.get: {str(e)}\n")
                import traceback
                f.write(traceback.format_exc())
    print("Results written to debug_results.txt")

if __name__ == "__main__":
    test_admin_api()

if __name__ == "__main__":
    test_admin_api()
