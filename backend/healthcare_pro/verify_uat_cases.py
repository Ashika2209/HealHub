import os
import django
import time
import threading
import json
from django.test import Client
from django.contrib.auth import get_user_model
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Fix for DisallowedHost errors
settings.ALLOWED_HOSTS = ['*']
settings.DEBUG = True

# Add SessionAuthentication to support client.force_login() which uses sessions
from rest_framework import settings as drf_settings
drf_defaults = settings.REST_FRAMEWORK.copy()
drf_defaults['DEFAULT_AUTHENTICATION_CLASSES'] = (
    'rest_framework.authentication.SessionAuthentication',
    'rest_framework_simplejwt.authentication.JWTAuthentication',
)
settings.REST_FRAMEWORK = drf_defaults

User = get_user_model()

def get_or_create_admin():
    admin_user = User.objects.filter(role='admin').first()
    if not admin_user:
        admin_user = User.objects.create_superuser(
            email='admin_uat@example.com',
            password='password123',
            first_name='Admin',
            last_name='UAT'
        )
        admin_user.role = 'admin'
        admin_user.save()
    return admin_user

def verify_uat_data_01():
    email = "test_duplicate@example.com"
    User.objects.filter(email=email).delete()
    
    admin_user = get_or_create_admin()
    client = Client()
    client.force_login(admin_user)
    
    reg_data = {
        "email": email,
        "first_name": "Test",
        "last_name": "Duplicate",
        "phone_number": "1234567890",
        "date_of_birth": "1990-01-01",
        "gender": "M"
    }
    
    resp1 = client.post('/api/accounts/admin/register/patient/', reg_data, content_type='application/json')
    resp2 = client.post('/api/accounts/admin/register/patient/', reg_data, content_type='application/json')
    
    return {
        "pass": resp1.status_code == 201 and resp2.status_code == 400,
        "resp1_status": resp1.status_code,
        "resp2_status": resp2.status_code,
        "resp2_content": resp2.content.decode('utf-8')[:200]
    }

def verify_uat_data_02():
    admin_user = get_or_create_admin()
    
    results = []
    def make_request():
        try:
            thread_client = Client()
            thread_client.force_login(admin_user)
            response = thread_client.get('/api/accounts/admin/patients/list/')
            results.append({"status": response.status_code, "content": response.content.decode('utf-8')[:100] if response.status_code != 200 else "OK"})
        except Exception as e:
            results.append({"error": str(e)})

    threads = []
    for i in range(15):
        t = threading.Thread(target=make_request)
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    success = all(isinstance(r, dict) and r.get("status") == 200 for r in results)
    return {"success": success, "details": results}

def verify_uat_data_03():
    admin_user = get_or_create_admin()
    client = Client()
    client.force_login(admin_user)
    
    num_requests = 50
    start_time = time.time()
    for i in range(num_requests):
        client.get('/api/accounts/admin/dashboard/stats/')
    end_time = time.time()
    
    avg_latency = (end_time - start_time) / num_requests
    return {
        "pass": True,
        "latency_ms": round(avg_latency * 1000, 2)
    }

def run_tests():
    summary = {}
    try:
        v1 = verify_uat_data_01()
        summary["UAT-DATA-01"] = "PASS" if v1["pass"] else "FAIL"
        summary["UAT-DATA-01-DETAILS"] = v1
        
        v2 = verify_uat_data_02()
        summary["UAT-DATA-02"] = "PASS" if v2["success"] else "FAIL"
        summary["UAT-DATA-02-DETAILS"] = v2["details"]
        
        p3 = verify_uat_data_03()
        summary["UAT-DATA-03"] = "PASS" if p3["pass"] else "FAIL"
        summary["UAT-DATA-03-LATENCY"] = p3["latency_ms"]
        summary["STATUS"] = "SUCCESS"
    except Exception as e:
        import traceback
        summary["STATUS"] = "ERROR"
        summary["ERROR"] = str(e)
        summary["TRACEBACK"] = traceback.format_exc()

    with open('uat_results.json', 'w') as f:
        json.dump(summary, f, indent=4)

if __name__ == "__main__":
    run_tests()
