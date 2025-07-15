#!/usr/bin/env python3
"""
Backend Test Suite for SPSS Academy Admin System
Tests admin authentication, authorization, user approval system, and access restrictions
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://e2bf0303-e162-4aac-af18-086f82895d6c.preview.emergentagent.com/api"

# Test accounts from seed data
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

class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def add_pass(self, test_name):
        self.passed += 1
        print(f"✅ {test_name}")
        
    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        print(f"❌ {test_name}: {error}")
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        print(f"{'='*60}")
        return self.failed == 0

def make_request(method, endpoint, data=None, headers=None, expected_status=200):
    """Make HTTP request with error handling"""
    url = f"{BACKEND_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=10)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def login_user(credentials):
    """Login user and return token"""
    response = make_request("POST", "/auth/login", credentials)
    if response and response.status_code == 200:
        data = response.json()
        return data.get("access_token")
    return None

def get_auth_headers(token):
    """Get authorization headers"""
    return {"Authorization": f"Bearer {token}"}

def test_admin_authentication(result):
    """Test admin login functionality"""
    print("\n🔐 Testing Admin Authentication...")
    
    # Test successful admin login
    response = make_request("POST", "/auth/login", ADMIN_CREDENTIALS)
    if response and response.status_code == 200:
        data = response.json()
        if "access_token" in data and data.get("user", {}).get("role") == "admin":
            result.add_pass("Admin login successful")
            return data["access_token"]
        else:
            result.add_fail("Admin login", "Missing token or incorrect role in response")
    else:
        result.add_fail("Admin login", f"Status: {response.status_code if response else 'No response'}")
    
    return None

def test_admin_authorization(result, admin_token):
    """Test admin-only endpoints"""
    print("\n🔒 Testing Admin Authorization...")
    
    if not admin_token:
        result.add_fail("Admin authorization", "No admin token available")
        return
        
    headers = get_auth_headers(admin_token)
    
    # Test admin endpoints
    admin_endpoints = [
        "/admin/pending-users",
        "/admin/all-users", 
        "/admin/dashboard-stats"
    ]
    
    for endpoint in admin_endpoints:
        response = make_request("GET", endpoint, headers=headers)
        if response and response.status_code == 200:
            result.add_pass(f"Admin access to {endpoint}")
        else:
            result.add_fail(f"Admin access to {endpoint}", 
                          f"Status: {response.status_code if response else 'No response'}")

def test_non_admin_access_restriction(result):
    """Test that non-admin users cannot access admin endpoints"""
    print("\n🚫 Testing Non-Admin Access Restrictions...")
    
    # Test client access to admin endpoints
    client_token = login_user(CLIENT_CREDENTIALS)
    if client_token:
        headers = get_auth_headers(client_token)
        
        admin_endpoints = [
            "/admin/pending-users",
            "/admin/all-users",
            "/admin/dashboard-stats"
        ]
        
        for endpoint in admin_endpoints:
            response = make_request("GET", endpoint, headers=headers)
            if response and response.status_code == 403:
                result.add_pass(f"Client blocked from {endpoint}")
            else:
                result.add_fail(f"Client blocked from {endpoint}", 
                              f"Expected 403, got {response.status_code if response else 'No response'}")
    else:
        result.add_fail("Client login for restriction test", "Could not login client")
    
    # Test consultant access to admin endpoints  
    consultant_token = login_user(CONSULTANT_CREDENTIALS)
    if consultant_token:
        headers = get_auth_headers(consultant_token)
        
        for endpoint in admin_endpoints:
            response = make_request("GET", endpoint, headers=headers)
            if response and response.status_code == 403:
                result.add_pass(f"Consultant blocked from {endpoint}")
            else:
                result.add_fail(f"Consultant blocked from {endpoint}",
                              f"Expected 403, got {response.status_code if response else 'No response'}")
    else:
        result.add_fail("Consultant login for restriction test", "Could not login consultant")

def test_service_creation_restriction(result):
    """Test that only admin can create services"""
    print("\n🛠️ Testing Service Creation Restrictions...")
    
    test_service = {
        "title": "Test Service",
        "description": "Test service description",
        "price_range": "€50-100",
        "duration": "1-2 days",
        "features": ["Test feature"],
        "category": "test",
        "icon": "TestIcon"
    }
    
    # Test admin can create services
    admin_token = login_user(ADMIN_CREDENTIALS)
    if admin_token:
        headers = get_auth_headers(admin_token)
        response = make_request("POST", "/services/", test_service, headers)
        if response and response.status_code == 200:
            result.add_pass("Admin can create services")
        else:
            result.add_fail("Admin can create services", 
                          f"Status: {response.status_code if response else 'No response'}")
    else:
        result.add_fail("Admin service creation", "Could not login admin")
    
    # Test client cannot create services
    client_token = login_user(CLIENT_CREDENTIALS)
    if client_token:
        headers = get_auth_headers(client_token)
        response = make_request("POST", "/services/", test_service, headers)
        if response and response.status_code == 403:
            result.add_pass("Client blocked from creating services")
        else:
            result.add_fail("Client blocked from creating services",
                          f"Expected 403, got {response.status_code if response else 'No response'}")
    else:
        result.add_fail("Client service creation test", "Could not login client")
    
    # Test consultant cannot create services
    consultant_token = login_user(CONSULTANT_CREDENTIALS)
    if consultant_token:
        headers = get_auth_headers(consultant_token)
        response = make_request("POST", "/services/", test_service, headers)
        if response and response.status_code == 403:
            result.add_pass("Consultant blocked from creating services")
        else:
            result.add_fail("Consultant blocked from creating services",
                          f"Expected 403, got {response.status_code if response else 'No response'}")
    else:
        result.add_fail("Consultant service creation test", "Could not login consultant")

def test_training_creation_restriction(result):
    """Test that only admin can create training programs"""
    print("\n📚 Testing Training Creation Restrictions...")
    
    test_training = {
        "title": "Test Training Program",
        "description": "Test training description",
        "duration": "2 weeks",
        "price": 200.0,
        "max_participants": 20,
        "start_date": "2024-02-01T10:00:00Z",
        "end_date": "2024-02-15T16:00:00Z",
        "schedule": "Monday to Friday, 10:00-16:00",
        "prerequisites": ["Basic knowledge"],
        "learning_outcomes": ["Test outcome"],
        "materials_included": ["Test material"],
        "category": "test"
    }
    
    # Test admin can create training
    admin_token = login_user(ADMIN_CREDENTIALS)
    if admin_token:
        headers = get_auth_headers(admin_token)
        response = make_request("POST", "/training/", test_training, headers)
        if response and response.status_code == 200:
            result.add_pass("Admin can create training programs")
        else:
            result.add_fail("Admin can create training programs",
                          f"Status: {response.status_code if response else 'No response'}")
    else:
        result.add_fail("Admin training creation", "Could not login admin")
    
    # Test client cannot create training
    client_token = login_user(CLIENT_CREDENTIALS)
    if client_token:
        headers = get_auth_headers(client_token)
        response = make_request("POST", "/training/", test_training, headers)
        if response and response.status_code == 403:
            result.add_pass("Client blocked from creating training")
        else:
            result.add_fail("Client blocked from creating training",
                          f"Expected 403, got {response.status_code if response else 'No response'}")
    else:
        result.add_fail("Client training creation test", "Could not login client")
    
    # Test consultant cannot create training
    consultant_token = login_user(CONSULTANT_CREDENTIALS)
    if consultant_token:
        headers = get_auth_headers(consultant_token)
        response = make_request("POST", "/training/", test_training, headers)
        if response and response.status_code == 403:
            result.add_pass("Consultant blocked from creating training")
        else:
            result.add_fail("Consultant blocked from creating training",
                          f"Expected 403, got {response.status_code if response else 'No response'}")
    else:
        result.add_fail("Consultant training creation test", "Could not login consultant")

def test_user_approval_system(result):
    """Test user registration and approval system"""
    print("\n👥 Testing User Approval System...")
    
    # Test new user registration (should be pending)
    new_user = {
        "email": f"testuser_{datetime.now().timestamp()}@test.com",
        "password": "testpass123",
        "role": "client",
        "name": "Test User",
        "phone": "+355 69 000 0001",
        "company": "Test Company"
    }
    
    response = make_request("POST", "/auth/register", new_user)
    if response and response.status_code == 200:
        data = response.json()
        if "message" in data and "aprovimin" in data["message"]:
            result.add_pass("New user registration creates pending status")
            
            # Try to login with unapproved user (should fail)
            login_response = make_request("POST", "/auth/login", {
                "email": new_user["email"],
                "password": new_user["password"]
            })
            if login_response and login_response.status_code == 403:
                result.add_pass("Unapproved user login blocked")
            else:
                result.add_fail("Unapproved user login blocked",
                              f"Expected 403, got {login_response.status_code if login_response else 'No response'}")
        else:
            result.add_fail("New user registration", "Expected pending approval message")
    else:
        result.add_fail("New user registration", 
                      f"Status: {response.status_code if response else 'No response'}")

def test_dashboard_stats(result, admin_token):
    """Test admin dashboard statistics"""
    print("\n📊 Testing Dashboard Statistics...")
    
    if not admin_token:
        result.add_fail("Dashboard stats", "No admin token available")
        return
        
    headers = get_auth_headers(admin_token)
    response = make_request("GET", "/admin/dashboard-stats", headers=headers)
    
    if response and response.status_code == 200:
        data = response.json()
        required_fields = [
            "total_users", "pending_users", "active_users",
            "clients", "consultants", "total_services", 
            "total_trainings", "total_consultations"
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if not missing_fields:
            result.add_pass("Dashboard stats contains all required fields")
        else:
            result.add_fail("Dashboard stats", f"Missing fields: {missing_fields}")
    else:
        result.add_fail("Dashboard stats", 
                      f"Status: {response.status_code if response else 'No response'}")

def test_existing_user_login(result):
    """Test login for existing approved users"""
    print("\n🔑 Testing Existing User Login...")
    
    # Test client login
    client_token = login_user(CLIENT_CREDENTIALS)
    if client_token:
        result.add_pass("Approved client can login")
    else:
        result.add_fail("Approved client login", "Could not login client")
    
    # Test consultant login
    consultant_token = login_user(CONSULTANT_CREDENTIALS)
    if consultant_token:
        result.add_pass("Approved consultant can login")
    else:
        result.add_fail("Approved consultant login", "Could not login consultant")

def main():
    """Run all tests"""
    print("🧪 SPSS Academy Admin System Backend Tests")
    print("=" * 60)
    
    result = TestResult()
    
    # Test admin authentication first
    admin_token = test_admin_authentication(result)
    
    # Test admin authorization
    test_admin_authorization(result, admin_token)
    
    # Test access restrictions
    test_non_admin_access_restriction(result)
    
    # Test service creation restrictions
    test_service_creation_restriction(result)
    
    # Test training creation restrictions
    test_training_creation_restriction(result)
    
    # Test user approval system
    test_user_approval_system(result)
    
    # Test dashboard statistics
    test_dashboard_stats(result, admin_token)
    
    # Test existing user login
    test_existing_user_login(result)
    
    # Print summary
    success = result.summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())