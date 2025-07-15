#!/usr/bin/env python3
"""
Training and User Approval System Test
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
        response = requests.post(f"{BACKEND_URL}/auth/login", json=credentials, timeout=10)
        if response.status_code == 200:
            return response.json().get("access_token")
    except Exception as e:
        print(f"Login error: {e}")
    return None

def test_training_creation():
    """Test training program creation restrictions"""
    print("📚 Testing training creation restrictions...")
    
    test_training = {
        "title": "Test Training Program",
        "description": "Test training description",
        "duration": "2 weeks",
        "price": 200.0,
        "max_participants": 20,
        "start_date": "2024-03-01T10:00:00Z",
        "end_date": "2024-03-15T16:00:00Z",
        "schedule": "Monday to Friday, 10:00-16:00",
        "prerequisites": ["Basic knowledge"],
        "learning_outcomes": ["Test outcome"],
        "materials_included": ["Test material"],
        "category": "test"
    }
    
    # Test admin can create training
    admin_token = login_user(ADMIN_CREDENTIALS)
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        try:
            response = requests.post(f"{BACKEND_URL}/training/", json=test_training, headers=headers, timeout=10)
            print(f"Admin training creation: Status {response.status_code}")
            
            if response.status_code == 200:
                print("✅ Admin can create training programs")
            else:
                print(f"❌ Admin training creation failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Admin training creation error: {e}")
    else:
        print("❌ Could not login admin for training test")
    
    # Test client cannot create training
    client_token = login_user(CLIENT_CREDENTIALS)
    if client_token:
        headers = {"Authorization": f"Bearer {client_token}"}
        try:
            response = requests.post(f"{BACKEND_URL}/training/", json=test_training, headers=headers, timeout=10)
            print(f"Client training creation: Status {response.status_code}")
            
            if response.status_code == 403:
                print("✅ Client correctly blocked from creating training")
            else:
                print(f"❌ Client should be blocked from creating training, got {response.status_code}")
                
        except Exception as e:
            print(f"❌ Client training creation error: {e}")
    else:
        print("❌ Could not login client for training test")
    
    # Test consultant cannot create training
    consultant_token = login_user(CONSULTANT_CREDENTIALS)
    if consultant_token:
        headers = {"Authorization": f"Bearer {consultant_token}"}
        try:
            response = requests.post(f"{BACKEND_URL}/training/", json=test_training, headers=headers, timeout=10)
            print(f"Consultant training creation: Status {response.status_code}")
            
            if response.status_code == 403:
                print("✅ Consultant correctly blocked from creating training")
            else:
                print(f"❌ Consultant should be blocked from creating training, got {response.status_code}")
                
        except Exception as e:
            print(f"❌ Consultant training creation error: {e}")
    else:
        print("❌ Could not login consultant for training test")

def test_user_approval_system():
    """Test user registration and approval system"""
    print("\n👥 Testing user approval system...")
    
    # Create a new user for testing
    timestamp = int(datetime.now().timestamp())
    new_user = {
        "email": f"testuser_{timestamp}@test.com",
        "password": "testpass123",
        "role": "client",
        "name": "Test User",
        "phone": "+355 69 000 0001",
        "company": "Test Company"
    }
    
    # Test registration
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=new_user, timeout=10)
        print(f"New user registration: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "aprovimin" in data["message"]:
                print("✅ New user registration creates pending status")
                
                # Try to login with unapproved user (should fail)
                login_data = {
                    "email": new_user["email"],
                    "password": new_user["password"]
                }
                
                login_response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=10)
                print(f"Unapproved user login: Status {login_response.status_code}")
                
                if login_response.status_code == 403:
                    print("✅ Unapproved user login correctly blocked")
                else:
                    print(f"❌ Unapproved user should be blocked from login, got {login_response.status_code}")
                    
            else:
                print(f"❌ Expected pending approval message, got: {data}")
        else:
            print(f"❌ User registration failed: {response.text}")
            
    except Exception as e:
        print(f"❌ User registration error: {e}")

def test_dashboard_stats():
    """Test admin dashboard statistics"""
    print("\n📊 Testing dashboard statistics...")
    
    admin_token = login_user(ADMIN_CREDENTIALS)
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        try:
            response = requests.get(f"{BACKEND_URL}/admin/dashboard-stats", headers=headers, timeout=10)
            print(f"Dashboard stats: Status {response.status_code}")
            
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
                    print(f"   Total users: {data['total_users']}")
                    print(f"   Pending users: {data['pending_users']}")
                    print(f"   Active users: {data['active_users']}")
                    print(f"   Total services: {data['total_services']}")
                    print(f"   Total trainings: {data['total_trainings']}")
                else:
                    print(f"❌ Dashboard stats missing fields: {missing_fields}")
            else:
                print(f"❌ Dashboard stats failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Dashboard stats error: {e}")
    else:
        print("❌ Could not login admin for dashboard test")

def main():
    print("🧪 SPSS Academy - Training & User Approval Test")
    print("=" * 50)
    
    test_training_creation()
    test_user_approval_system()
    test_dashboard_stats()
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    main()