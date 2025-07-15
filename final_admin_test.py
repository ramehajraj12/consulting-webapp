#!/usr/bin/env python3
"""
Final Comprehensive Admin System Test
"""

import requests
import json
import sys
import time
from datetime import datetime

BACKEND_URL = "https://e2bf0303-e162-4aac-af18-086f82895d6c.preview.emergentagent.com/api"

ADMIN_CREDENTIALS = {
    "email": "admin@spssacademy.com",
    "password": "password123"
}

CLIENT_CREDENTIALS = {
    "email": "fatmir.leshi@qsut.al", 
    "password": "password123"
}

CONSULTANT_CREDENTIALS = {
    "email": "alba.hasani@spssacademy.al",
    "password": "password123"
}

def login_user(credentials):
    """Login user and return token"""
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json=credentials, timeout=15)
        if response.status_code == 200:
            return response.json().get("access_token")
    except Exception as e:
        print(f"Login error: {e}")
    return None

def test_admin_system():
    """Test complete admin system"""
    print("🧪 SPSS Academy Admin System - Comprehensive Test")
    print("=" * 60)
    
    results = {
        "passed": 0,
        "failed": 0,
        "errors": []
    }
    
    # 1. Test Admin Authentication
    print("\n🔐 1. Testing Admin Authentication...")
    admin_token = login_user(ADMIN_CREDENTIALS)
    if admin_token:
        print("✅ Admin login successful")
        results["passed"] += 1
    else:
        print("❌ Admin login failed")
        results["failed"] += 1
        results["errors"].append("Admin login failed")
    
    # 2. Test Client Authentication  
    print("\n🔐 2. Testing Client Authentication...")
    client_token = login_user(CLIENT_CREDENTIALS)
    if client_token:
        print("✅ Client login successful")
        results["passed"] += 1
    else:
        print("❌ Client login failed")
        results["failed"] += 1
        results["errors"].append("Client login failed")
    
    # 3. Test Consultant Authentication
    print("\n🔐 3. Testing Consultant Authentication...")
    consultant_token = login_user(CONSULTANT_CREDENTIALS)
    if consultant_token:
        print("✅ Consultant login successful")
        results["passed"] += 1
    else:
        print("❌ Consultant login failed")
        results["failed"] += 1
        results["errors"].append("Consultant login failed")
    
    # 4. Test Admin Endpoints Access
    print("\n🔒 4. Testing Admin Endpoints Access...")
    if admin_token:
        admin_endpoints = [
            "/admin/pending-users",
            "/admin/all-users", 
            "/admin/dashboard-stats"
        ]
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        for endpoint in admin_endpoints:
            try:
                response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers, timeout=15)
                if response.status_code == 200:
                    print(f"✅ Admin access to {endpoint}")
                    results["passed"] += 1
                else:
                    print(f"❌ Admin access to {endpoint} failed: {response.status_code}")
                    results["failed"] += 1
                    results["errors"].append(f"Admin access to {endpoint} failed")
            except Exception as e:
                print(f"❌ Error accessing {endpoint}: {e}")
                results["failed"] += 1
                results["errors"].append(f"Error accessing {endpoint}")
    
    # 5. Test Non-Admin Access Restrictions
    print("\n🚫 5. Testing Non-Admin Access Restrictions...")
    if client_token:
        headers = {"Authorization": f"Bearer {client_token}"}
        for endpoint in ["/admin/pending-users", "/admin/all-users", "/admin/dashboard-stats"]:
            try:
                response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers, timeout=15)
                if response.status_code == 403:
                    print(f"✅ Client blocked from {endpoint}")
                    results["passed"] += 1
                else:
                    print(f"❌ Client should be blocked from {endpoint}, got {response.status_code}")
                    results["failed"] += 1
                    results["errors"].append(f"Client not blocked from {endpoint}")
            except Exception as e:
                print(f"❌ Error testing {endpoint}: {e}")
                results["failed"] += 1
                results["errors"].append(f"Error testing {endpoint}")
    
    # 6. Test Service Creation Restrictions
    print("\n🛠️ 6. Testing Service Creation Restrictions...")
    test_service = {
        "title": "Test Service",
        "description": "Test service description",
        "price_range": "€50-100",
        "duration": "1-2 days",
        "features": ["Test feature"],
        "category": "test",
        "icon": "TestIcon"
    }
    
    # Admin should be able to create
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        try:
            response = requests.post(f"{BACKEND_URL}/services/", json=test_service, headers=headers, timeout=15)
            if response.status_code == 200:
                print("✅ Admin can create services")
                results["passed"] += 1
            else:
                print(f"❌ Admin service creation failed: {response.status_code}")
                results["failed"] += 1
                results["errors"].append("Admin service creation failed")
        except Exception as e:
            print(f"❌ Admin service creation error: {e}")
            results["failed"] += 1
            results["errors"].append("Admin service creation error")
    
    # Client should be blocked
    if client_token:
        headers = {"Authorization": f"Bearer {client_token}"}
        try:
            response = requests.post(f"{BACKEND_URL}/services/", json=test_service, headers=headers, timeout=15)
            if response.status_code == 403:
                print("✅ Client blocked from creating services")
                results["passed"] += 1
            else:
                print(f"❌ Client should be blocked from creating services, got {response.status_code}")
                results["failed"] += 1
                results["errors"].append("Client not blocked from creating services")
        except Exception as e:
            print(f"❌ Client service creation test error: {e}")
            results["failed"] += 1
            results["errors"].append("Client service creation test error")
    
    # 7. Test Training Creation Restrictions
    print("\n📚 7. Testing Training Creation Restrictions...")
    test_training = {
        "title": "Test Training Program",
        "description": "Test training description",
        "level": "Fillestar",
        "duration": "4 javë",
        "price": 200.0,
        "modules": ["Module 1", "Module 2"],
        "video_urls": [],
        "materials": ["Material 1"]
    }
    
    # Admin should be able to create
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        try:
            response = requests.post(f"{BACKEND_URL}/training/", json=test_training, headers=headers, timeout=15)
            if response.status_code == 200:
                print("✅ Admin can create training programs")
                results["passed"] += 1
            else:
                print(f"❌ Admin training creation failed: {response.status_code}")
                results["failed"] += 1
                results["errors"].append("Admin training creation failed")
        except Exception as e:
            print(f"❌ Admin training creation error: {e}")
            results["failed"] += 1
            results["errors"].append("Admin training creation error")
    
    # Client should be blocked
    if client_token:
        headers = {"Authorization": f"Bearer {client_token}"}
        try:
            response = requests.post(f"{BACKEND_URL}/training/", json=test_training, headers=headers, timeout=15)
            if response.status_code == 403:
                print("✅ Client blocked from creating training")
                results["passed"] += 1
            else:
                print(f"❌ Client should be blocked from creating training, got {response.status_code}")
                results["failed"] += 1
                results["errors"].append("Client not blocked from creating training")
        except Exception as e:
            print(f"❌ Client training creation test error: {e}")
            results["failed"] += 1
            results["errors"].append("Client training creation test error")
    
    # 8. Test User Registration and Approval System
    print("\n👥 8. Testing User Registration and Approval System...")
    timestamp = int(datetime.now().timestamp())
    new_user = {
        "email": f"testuser_{timestamp}@test.com",
        "password": "testpass123",
        "role": "client",
        "name": "Test User",
        "phone": "+355 69 000 0001",
        "company": "Test Company"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=new_user, timeout=15)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "aprovimin" in data["message"]:
                print("✅ New user registration creates pending status")
                results["passed"] += 1
                
                # Try to login with unapproved user (should fail)
                login_data = {
                    "email": new_user["email"],
                    "password": new_user["password"]
                }
                
                login_response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=15)
                if login_response.status_code == 403:
                    print("✅ Unapproved user login blocked")
                    results["passed"] += 1
                else:
                    print(f"❌ Unapproved user should be blocked from login, got {login_response.status_code}")
                    results["failed"] += 1
                    results["errors"].append("Unapproved user not blocked from login")
            else:
                print(f"❌ Expected pending approval message, got: {data}")
                results["failed"] += 1
                results["errors"].append("Registration didn't create pending status")
        else:
            print(f"❌ User registration failed: {response.status_code}")
            results["failed"] += 1
            results["errors"].append("User registration failed")
    except Exception as e:
        print(f"❌ User registration error: {e}")
        results["failed"] += 1
        results["errors"].append("User registration error")
    
    # 9. Test Dashboard Statistics
    print("\n📊 9. Testing Dashboard Statistics...")
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        try:
            response = requests.get(f"{BACKEND_URL}/admin/dashboard-stats", headers=headers, timeout=15)
            if response.status_code == 200:
                data = response.json()
                required_fields = [
                    "total_users", "pending_users", "active_users",
                    "clients", "consultants", "total_services", 
                    "total_trainings", "total_consultations"
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    print("✅ Dashboard stats contains all required fields")
                    results["passed"] += 1
                else:
                    print(f"❌ Dashboard stats missing fields: {missing_fields}")
                    results["failed"] += 1
                    results["errors"].append("Dashboard stats missing fields")
            else:
                print(f"❌ Dashboard stats failed: {response.status_code}")
                results["failed"] += 1
                results["errors"].append("Dashboard stats failed")
        except Exception as e:
            print(f"❌ Dashboard stats error: {e}")
            results["failed"] += 1
            results["errors"].append("Dashboard stats error")
    
    # Print Final Results
    print("\n" + "=" * 60)
    print("FINAL TEST RESULTS")
    print("=" * 60)
    total = results["passed"] + results["failed"]
    print(f"✅ PASSED: {results['passed']}/{total}")
    print(f"❌ FAILED: {results['failed']}/{total}")
    
    if results["errors"]:
        print(f"\nFAILED TESTS:")
        for error in results["errors"]:
            print(f"  - {error}")
    
    print("=" * 60)
    
    return results["failed"] == 0

if __name__ == "__main__":
    success = test_admin_system()
    sys.exit(0 if success else 1)