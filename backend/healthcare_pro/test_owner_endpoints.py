import requests
import json

def test_owner_endpoints():
    base_url = 'http://127.0.0.1:8000'
    login_url = f'{base_url}/api/accounts/login/'
    
    # Credentials from create_owner.py
    credentials = {
        'email': 'owner@healthcarepro.com',
        'password': 'ownerpassword123',
        'role': 'owner'
    }
    
    print("🚀 Testing Owner Authentication and Endpoints...")
    
    try:
        # 1. Login as Owner
        print("\n🔑 Logging in as Owner...")
        response = requests.post(login_url, json=credentials)
        if response.status_code != 200:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)
            return
        
        auth_data = response.json()
        token = auth_data['access']
        headers = {'Authorization': f'Bearer {token}'}
        print("✅ Login successful")
        
        # 2. Test Stats Endpoint
        print("\n📊 Testing Stats Endpoint...")
        stats_url = f'{base_url}/api/accounts/owner/dashboard/stats/'
        res = requests.get(stats_url, headers=headers)
        if res.status_code == 200:
            print("✅ Stats retrieved successfully")
            print(json.dumps(res.json(), indent=2))
        else:
            print(f"❌ Stats failed: {res.status_code}")
            
        # 3. Test Doctor Performance Endpoint
        print("\n👨‍⚕️ Testing Doctor Performance Endpoint...")
        perf_url = f'{base_url}/api/accounts/owner/doctor-performance/'
        res = requests.get(perf_url, headers=headers)
        if res.status_code == 200:
            print(f"✅ Performance data retrieved: {len(res.json())} doctors found")
        else:
            print(f"❌ Performance failed: {res.status_code}")
            
        # 4. Test Analytics Endpoint
        print("\n📈 Testing Hospital Analytics Endpoint...")
        analytics_url = f'{base_url}/api/accounts/owner/hospital-analytics/'
        res = requests.get(analytics_url, headers=headers)
        if res.status_code == 200:
            print("✅ Analytics retrieved successfully")
        else:
            print(f"❌ Analytics failed: {res.status_code}")
            
        # 5. Test Upcoming Appointments Endpoint
        print("\n📅 Testing Upcoming Appointments Endpoint...")
        upcoming_url = f'{base_url}/api/accounts/owner/upcoming-appointments/'
        res = requests.get(upcoming_url, headers=headers)
        if res.status_code == 200:
            print(f"✅ Upcoming appointments retrieved: {len(res.json())} found")
        else:
            print(f"❌ Upcoming appointments failed: {res.status_code}")

    except Exception as e:
        print(f"❌ Test error: {e}")

if __name__ == "__main__":
    test_owner_endpoints()
