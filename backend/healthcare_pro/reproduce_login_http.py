import requests
import json

url = "http://127.0.0.1:8000/api/accounts/login/"
headers = {'Content-Type': 'application/json'}
data = {
    "email": "muruli@p.com",
    "password": "password123",
    "role": "patient"
}

try:
    print(f"Sending POST to {url}")
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print("Response Content Preview:")
    print(response.text[:2000])  
except Exception as e:
    print(f"Request failed: {e}")
