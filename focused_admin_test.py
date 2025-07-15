#!/usr/bin/env python3
"""
Focused Admin System Test - Testing core admin functionality
"""

import requests
import json
import sys
import time

BACKEND_URL = "https://e2bf0303-e162-4aac-af18-086f82895d6c.preview.emergentagent.com/api"

ADMIN_CREDENTIALS = {
    "email": "admin@spssacademy.com",
    "password": "password123"
}

CLIENT_CREDENTIALS = {
    "email": "fatmir.leshi@qsut.al", 
    "password": "password123"
}

def test_admin_login():
    """Test admin login"""
    print("🔐 Testing admin login...")
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json=ADMIN_CREDENTIALS, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Admin login successful")
            print(f"User role: {data.get('user', {}).get('role')}")
            return data.get("access_token")
        else:
            print(f"❌ Admin login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Admin login error: {e}")
        return None

def test_client_login():
    """Test client login"""
    print("\n🔐 Testing client login...")
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json=CLIENT_CREDENTIALS, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Client login successful")
            print(f"User role: {data.get('user', {}).get('role')}")
            return data.get("access_token")
        else:
            print(f"❌ Client login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Client login error: {e}")
        return None

def test_admin_endpoints(admin_token):
    """Test admin-only endpoints"""
    print("\n🔒 Testing admin endpoints...")
    
    if not admin_token:
        print("❌ No admin token available")
        return
        
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    endpoints = [
        "/admin/pending-users",
        "/admin/all-users", 
        "/admin/dashboard-stats"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers, timeout=10)
            print(f"{endpoint}: Status {response.status_code}")
            
            if response.status_code == 200:
                print(f"✅ Admin access to {endpoint} successful")
            else:
                print(f"❌ Admin access to {endpoint} failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Error accessing {endpoint}: {e}")

def test_client_admin_access(client_token):
    """Test client access to admin endpoints (should be blocked)"""
    print("\n🚫 Testing client access to admin endpoints...")
    
    if not client_token:
        print("❌ No client token available")
        return
        
    headers = {"Authorization": f"Bearer {client_token}"}
    
    endpoints = [
        "/admin/pending-users",
        "/admin/all-users", 
        "/admin/dashboard-stats"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers, timeout=10)
            print(f"{endpoint}: Status {response.status_code}")
            
            if response.status_code == 403:
                print(f"✅ Client correctly blocked from {endpoint}")
            else:
                print(f"❌ Client should be blocked from {endpoint}, got {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error testing {endpoint}: {e}")

def test_service_creation(admin_token, client_token):
    """Test service creation restrictions"""
    print("\n🛠️ Testing service creation...")
    
    test_service = {
        "title": "Test Service",
        "description": "Test service description",
        "price_range": "€50-100",
        "duration": "1-2 days",
        "features": ["Test feature"],
        "category": "test",
        "icon": "TestIcon"
    }
    
    # Test admin can create
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        try:
            response = requests.post(f"{BACKEND_URL}/services/", json=test_service, headers=headers, timeout=10)
            print(f"Admin service creation: Status {response.status_code}")
            
            if response.status_code == 200:
                print("✅ Admin can create services")
            else:
                print(f"❌ Admin service creation failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Admin service creation error: {e}")
    
    # Test client cannot create
    if client_token:
        headers = {"Authorization": f"Bearer {client_token}"}
        try:
            response = requests.post(f"{BACKEND_URL}/services/", json=test_service, headers=headers, timeout=10)
            print(f"Client service creation: Status {response.status_code}")
            
            if response.status_code == 403:
                print("✅ Client correctly blocked from creating services")
            else:
                print(f"❌ Client should be blocked from creating services, got {response.status_code}")
                
        except Exception as e:
            print(f"❌ Client service creation error: {e}")

def main():
    print("🧪 SPSS Academy Admin System - Focused Test")
    print("=" * 50)
    
    # Test logins
    admin_token = test_admin_login()
    client_token = test_client_login()
    
    # Test admin functionality
    test_admin_endpoints(admin_token)
    
    # Test access restrictions
    test_client_admin_access(client_token)
    
    # Test service creation
    test_service_creation(admin_token, client_token)
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    main()