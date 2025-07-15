#!/usr/bin/env python3
"""
Data seeder for SPSS Academy
This script will populate the database with initial data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'spss_academy')]

# Password hash for 'password123' (for testing purposes)
PASSWORD_HASH = "$2b$12$sLZ0vjsV0beKA16so9arqur4sb1BRJktYZ69NDQv1hSlERMKe17FW"

async def seed_services():
    """Seed services data"""
    services = [
        {
            "_id": "service_1",
            "title": "Analiza Statistikore në SPSS",
            "description": "Analizë e plotë e të dhënave tuaja me mjete të avancuara statistikore në SPSS.",
            "price_range": "€50-200",
            "duration": "2-5 ditë",
            "features": [
                "Analiza deskriptive",
                "Teste hipotezash",
                "Analiza regresioni",
                "Analiza ANOVA",
                "Raport i detajuar me interpretim"
            ],
            "category": "analiza",
            "icon": "BarChart3",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "service_2",
            "title": "Konsulencë 1-në-1",
            "description": "Seancë konsultimi personale me ekspertë statistikorë për projektin tuaj.",
            "price_range": "€30/orë",
            "duration": "1-2 orë",
            "features": [
                "Konsultim i personalizuar",
                "Zgjidhja e problemeve specifike",
                "Udhëzime hap pas hapi",
                "Mbështetje e vazhdueshme",
                "Materiale të përshtatura"
            ],
            "category": "konsultim",
            "icon": "Users",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "service_3",
            "title": "Interpretim Rezultatesh",
            "description": "Interpretim profesional i rezultateve statistikore për publikim akademik.",
            "price_range": "€40-120",
            "duration": "1-3 ditë",
            "features": [
                "Interpretim i detajuar",
                "Përgatitje për publikim",
                "Grafika dhe tabela",
                "Rekomandime për përmirësim",
                "Verifikim cilësie"
            ],
            "category": "interpretim",
            "icon": "FileText",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "service_4",
            "title": "Projektim Studimi",
            "description": "Projektim dhe planifikim i studimeve kërkimore me metodologji të qëndrueshme.",
            "price_range": "€80-300",
            "duration": "3-7 ditë",
            "features": [
                "Projektim metodologjik",
                "Përllogaritje madhësie kampioni",
                "Përzgjedhje metodash statistikore",
                "Plan analitik",
                "Protokoll studimi"
            ],
            "category": "projektim",
            "icon": "PenTool",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.services.delete_many({})
    await db.services.insert_many(services)
    print("✓ Services seeded successfully")

async def seed_users():
    """Seed users data"""
    users = [
        {
            "_id": "admin_1",
            "email": "admin@spssacademy.com",
            "password_hash": PASSWORD_HASH,
            "role": "admin",
            "name": "Admin SPSS Academy",
            "phone": "+355 69 000 0000",
            "company": "SPSS Academy",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "is_approved": True,
            "approved_by": "system",
            "approved_at": datetime.utcnow()
        },
        {
            "_id": "consultant_1",
            "email": "alba.hasani@spssacademy.al",
            "password_hash": PASSWORD_HASH,
            "role": "consultant",
            "name": "Dr. Alba Hasani",
            "phone": "+355 69 123 4567",
            "company": "SPSS Academy",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "is_approved": True,
            "approved_by": "admin_1",
            "approved_at": datetime.utcnow()
        },
        {
            "_id": "consultant_2",
            "email": "marin.kodra@spssacademy.al",
            "password_hash": PASSWORD_HASH,
            "role": "consultant",
            "name": "Prof. Marin Kodra",
            "phone": "+355 69 234 5678",
            "company": "SPSS Academy",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "is_approved": True,
            "approved_by": "admin_1",
            "approved_at": datetime.utcnow()
        },
        {
            "_id": "consultant_3",
            "email": "ines.brahimi@spssacademy.al",
            "password_hash": PASSWORD_HASH,
            "role": "consultant",
            "name": "Dr. Ines Brahimi",
            "phone": "+355 69 345 6789",
            "company": "SPSS Academy",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "is_approved": True,
            "approved_by": "admin_1",
            "approved_at": datetime.utcnow()
        },
        {
            "_id": "client_1",
            "email": "fatmir.leshi@qsut.al",
            "password_hash": PASSWORD_HASH,
            "role": "client",
            "name": "Dr. Fatmir Leshi",
            "phone": "+355 69 456 7890",
            "company": "QSUT",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "is_approved": True,
            "approved_by": "admin_1",
            "approved_at": datetime.utcnow()
        },
        {
            "_id": "client_2",
            "email": "marina.tirana@student.al",
            "password_hash": PASSWORD_HASH,
            "role": "client",
            "name": "Marina Tirana",
            "phone": "+355 69 567 8901",
            "company": "Universiteti i Tiranës",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "is_approved": True,
            "approved_by": "admin_1",
            "approved_at": datetime.utcnow()
        }
    ]
    
    await db.users.delete_many({})
    await db.users.insert_many(users)
    print("✓ Users seeded successfully")

async def seed_consultants():
    """Seed consultants data"""
    consultants = [
        {
            "_id": "consultant_profile_1",
            "user_id": "consultant_1",
            "title": "Ekspert Statistikor",
            "specialization": "Statistika mjekësore",
            "experience": "12 vite",
            "bio": "Ekspert me përvoje të gjatë në analizën statistikore për kërkime mjekësore dhe epidemiologjike.",
            "rating": 4.9,
            "hourly_rate": 50.0,
            "availability": {
                "monday": ["09:00-17:00"],
                "tuesday": ["09:00-17:00"],
                "wednesday": ["09:00-17:00"],
                "thursday": ["09:00-17:00"],
                "friday": ["09:00-17:00"]
            },
            "certifications": [
                "PhD në Statistika",
                "Certifikim SPSS Expert",
                "Certifikim në Biostatistika"
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "consultant_profile_2",
            "user_id": "consultant_2",
            "title": "Konsulent i Lartë",
            "specialization": "Metodologji kërkimi",
            "experience": "15 vite",
            "bio": "Profesor univerzitar me specializim në metodologjinë e kërkimit dhe analizën e të dhënave.",
            "rating": 4.8,
            "hourly_rate": 60.0,
            "availability": {
                "monday": ["10:00-16:00"],
                "tuesday": ["10:00-16:00"],
                "wednesday": ["10:00-16:00"],
                "thursday": ["10:00-16:00"],
                "friday": ["10:00-16:00"]
            },
            "certifications": [
                "PhD në Metodologji Kërkimi",
                "Certifikim SPSS Advanced",
                "Certifikim në Analizën e Të Dhënave"
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "consultant_profile_3",
            "user_id": "consultant_3",
            "title": "Analist i Të Dhënave",
            "specialization": "Statistika biznesore",
            "experience": "8 vite",
            "bio": "Specialiste në analizën e të dhënave për bizneset dhe studimet e tregut.",
            "rating": 4.7,
            "hourly_rate": 45.0,
            "availability": {
                "monday": ["09:00-18:00"],
                "tuesday": ["09:00-18:00"],
                "wednesday": ["09:00-18:00"],
                "thursday": ["09:00-18:00"],
                "friday": ["09:00-18:00"]
            },
            "certifications": [
                "MSc në Analizën e Të Dhënave",
                "Certifikim SPSS Professional",
                "Certifikim në Business Intelligence"
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.consultants.delete_many({})
    await db.consultants.insert_many(consultants)
    print("✓ Consultants seeded successfully")

async def seed_projects():
    """Seed projects data"""
    projects = [
        {
            "_id": "project_1",
            "client_id": "client_1",
            "consultant_id": "consultant_1",
            "title": "Analiza të Dhënave Kërkimore",
            "description": "Analizë statistikore për studim epidemiologjik në QSUT",
            "status": "in-progress",
            "progress": 75,
            "deadline": datetime.utcnow() + timedelta(days=15),
            "price": 1200.0,
            "type": "Analiza Statistikore",
            "created_at": datetime.utcnow() - timedelta(days=10),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "project_2",
            "client_id": "client_2",
            "consultant_id": "consultant_2",
            "title": "Studim Epidemiologjik",
            "description": "Projektim dhe analiza për studim epidemiologjik",
            "status": "completed",
            "progress": 100,
            "deadline": datetime.utcnow() - timedelta(days=5),
            "price": 800.0,
            "type": "Kërkime Mjekësore",
            "created_at": datetime.utcnow() - timedelta(days=30),
            "updated_at": datetime.utcnow() - timedelta(days=5)
        },
        {
            "_id": "project_3",
            "client_id": "client_1",
            "consultant_id": "consultant_3",
            "title": "Analiza Tregut",
            "description": "Analizë e të dhënave për studim tregu",
            "status": "pending",
            "progress": 25,
            "deadline": datetime.utcnow() + timedelta(days=28),
            "price": 600.0,
            "type": "Analiza Biznesi",
            "created_at": datetime.utcnow() - timedelta(days=5),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.projects.delete_many({})
    await db.projects.insert_many(projects)
    print("✓ Projects seeded successfully")

async def seed_consultations():
    """Seed consultations data"""
    consultations = [
        {
            "_id": "consultation_1",
            "client_id": "client_1",
            "consultant_id": "consultant_1",
            "service_id": "service_2",
            "consultation_type": "online",
            "date": datetime.utcnow() + timedelta(days=2),
            "duration": 90,
            "status": "confirmed",
            "notes": "Diskutim rreth metodologjisë së studimit",
            "meeting_link": "https://meet.google.com/abc-def-ghi",
            "project_description": "Analizë statistikore për studim epidemiologjik",
            "urgency": "medium",
            "created_at": datetime.utcnow() - timedelta(days=1),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "consultation_2",
            "client_id": "client_2",
            "consultant_id": "consultant_2",
            "service_id": "service_1",
            "consultation_type": "phone",
            "date": datetime.utcnow() + timedelta(days=5),
            "duration": 60,
            "status": "pending",
            "notes": "Konsultim për interpretimin e rezultateve",
            "project_description": "Ndihmë me interpretimin e rezultateve SPSS",
            "urgency": "low",
            "created_at": datetime.utcnow() - timedelta(hours=12),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.consultations.delete_many({})
    await db.consultations.insert_many(consultations)
    print("✓ Consultations seeded successfully")

async def seed_notifications():
    """Seed notifications data"""
    notifications = [
        {
            "_id": "notification_1",
            "user_id": "client_1",
            "type": "success",
            "title": "Projekt i Përfunduar",
            "message": "Projekti 'Analiza të Dhënave Kërkimore' u përfundua me sukses.",
            "read": False,
            "created_at": datetime.utcnow() - timedelta(hours=2)
        },
        {
            "_id": "notification_2",
            "user_id": "client_1",
            "type": "info",
            "title": "Konsultim i Ardhshëm",
            "message": "Ju keni një konsultim të programuar për nesër në orën 14:00.",
            "read": True,
            "created_at": datetime.utcnow() - timedelta(days=1)
        },
        {
            "_id": "notification_3",
            "user_id": "consultant_1",
            "type": "info",
            "title": "Kërkesë e Re",
            "message": "Keni një kërkesë të re për konsultim nga Dr. Fatmir Leshi.",
            "read": False,
            "created_at": datetime.utcnow() - timedelta(hours=6)
        }
    ]
    
    await db.notifications.delete_many({})
    await db.notifications.insert_many(notifications)
    print("✓ Notifications seeded successfully")

async def main():
    """Run all seeders"""
    print("🌱 Starting database seeding...")
    
    await seed_services()
    await seed_users()
    await seed_consultants()
    await seed_projects()
    await seed_consultations()
    await seed_notifications()
    
    print("✅ Database seeding completed successfully!")
    print("\nTest accounts created:")
    print("Consultant: alba.hasani@spssacademy.al / password123")
    print("Client: fatmir.leshi@qsut.al / password123")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(main())