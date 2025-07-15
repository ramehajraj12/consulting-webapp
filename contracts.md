# SPSS Academy - Backend Integration Contracts

## Project Overview
SPSS Academy është një platformë e plotë për konsulencë statistikore në SPSS dhe trajnime me dy lloje përdoruesish: Klientë dhe Konsulentë.

## Authentication System

### User Types
1. **Client** - Klientë që kërkojnë shërbime
2. **Consultant** - Konsulentë që ofrojnë shërbime

### Auth Endpoints
- `POST /api/auth/register` - Regjistrimi i përdoruesit
- `POST /api/auth/login` - Identifikimi
- `POST /api/auth/logout` - Dalja
- `GET /api/auth/profile` - Profili i përdoruesit
- `PUT /api/auth/profile` - Përditësimi i profilit

## Database Models

### Users
```python
class User:
    id: ObjectId
    email: str
    password_hash: str
    role: str  # "client" or "consultant"
    name: str
    phone: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
```

### Consultants (extends User)
```python
class Consultant:
    user_id: ObjectId
    title: str
    specialization: str
    experience: str
    bio: str
    rating: float
    hourly_rate: float
    availability: dict
    certifications: list
```

### Services
```python
class Service:
    id: ObjectId
    title: str
    description: str
    price_range: str
    duration: str
    features: list
    category: str
    created_at: datetime
```

### Training Programs
```python
class TrainingProgram:
    id: ObjectId
    title: str
    description: str
    level: str
    duration: str
    price: float
    rating: float
    modules: list
    instructor_id: ObjectId
    created_at: datetime
```

### Consultations
```python
class Consultation:
    id: ObjectId
    client_id: ObjectId
    consultant_id: ObjectId
    service_id: ObjectId
    consultation_type: str  # "online", "phone", "in-person"
    date: datetime
    duration: int
    status: str  # "pending", "confirmed", "completed", "cancelled"
    notes: str
    meeting_link: str
    created_at: datetime
```

### Projects
```python
class Project:
    id: ObjectId
    client_id: ObjectId
    consultant_id: ObjectId
    title: str
    description: str
    status: str  # "pending", "in-progress", "completed", "cancelled"
    progress: int
    deadline: datetime
    price: float
    created_at: datetime
    updated_at: datetime
```

### Project Files
```python
class ProjectFile:
    id: ObjectId
    project_id: ObjectId
    filename: str
    file_path: str
    file_type: str
    file_size: int
    uploaded_by: ObjectId
    uploaded_at: datetime
```

### Blog Posts
```python
class BlogPost:
    id: ObjectId
    title: str
    content: str
    excerpt: str
    author_id: ObjectId
    category: str
    tags: list
    published: bool
    created_at: datetime
    updated_at: datetime
```

### Notifications
```python
class Notification:
    id: ObjectId
    user_id: ObjectId
    type: str
    message: str
    read: bool
    created_at: datetime
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Regjistrimi
- `POST /api/auth/login` - Identifikimi
- `POST /api/auth/logout` - Dalja
- `GET /api/auth/profile` - Profili

### Services
- `GET /api/services` - Lista e shërbimeve
- `GET /api/services/{id}` - Detajet e shërbimit
- `POST /api/services` - Krijimi i shërbimit (consultant only)
- `PUT /api/services/{id}` - Përditësimi (consultant only)

### Training Programs
- `GET /api/training` - Lista e trajnimeve
- `GET /api/training/{id}` - Detajet e trajnimit
- `POST /api/training/enroll` - Regjistrimi në trajnim

### Consultations
- `GET /api/consultations` - Lista e konsultimeve
- `POST /api/consultations` - Rezervimi i konsultimit
- `PUT /api/consultations/{id}` - Përditësimi i konsultimit
- `DELETE /api/consultations/{id}` - Anulimi

### Projects
- `GET /api/projects` - Lista e projekteve
- `GET /api/projects/{id}` - Detajet e projektit
- `POST /api/projects` - Krijimi i projektit
- `PUT /api/projects/{id}` - Përditësimi i projektit
- `PUT /api/projects/{id}/status` - Ndryshimi i statusit

### Files
- `GET /api/projects/{project_id}/files` - Lista e dokumenteve
- `POST /api/projects/{project_id}/files` - Ngarkimi i dokumentit
- `DELETE /api/files/{id}` - Fshirja e dokumentit
- `GET /api/files/{id}/download` - Shkarkimi

### Blog
- `GET /api/blog` - Lista e artikujve
- `GET /api/blog/{id}` - Detajet e artikullit
- `POST /api/blog` - Krijimi i artikullit (consultant only)

### Notifications
- `GET /api/notifications` - Lista e njoftimeve
- `PUT /api/notifications/{id}/read` - Shënoji si të lexuar

### Dashboard Data
- `GET /api/dashboard/client` - Të dhënat për klientin
- `GET /api/dashboard/consultant` - Të dhënat për konsulentin

## Frontend Integration Changes

### Current Mock Data Integration
- Zëvendëso të gjitha mock data calls me API calls
- Implemento loading states
- Shto error handling
- Implemento authentication context

### Dashboard Components
1. **Client Dashboard**
   - Lista e projekteve të klientit
   - Konsultimet e ardhshme
   - Dokumentet e projektit
   - Njoftimet

2. **Consultant Dashboard**
   - Lista e projekteve aktive
   - Kalendar konsultimesh
   - Statistika të ardhurash
   - Menaxhim shërbimesh

### Authentication Flow
1. Login/Register pages
2. Protected routes
3. Role-based access
4. Session management

## Features to Implement

### Phase 1: Core Backend
- [x] User authentication system
- [x] Database models setup
- [x] Basic CRUD operations
- [x] API endpoints

### Phase 2: Frontend Integration
- [ ] Remove mock data
- [ ] Implement API calls
- [ ] Add loading states
- [ ] Error handling

### Phase 3: Advanced Features
- [ ] File upload system
- [ ] Real-time notifications
- [ ] Email system
- [ ] Payment integration

## Security Considerations
- JWT tokens for authentication
- Password hashing
- Input validation
- File upload security
- Rate limiting

## File Structure Updates
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── dashboard/
│   │   │   ├── ClientDashboard.jsx
│   │   │   └── ConsultantDashboard.jsx
│   │   └── ui/
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── api.js
│   └── utils/
│       └── auth.js

backend/
├── models/
│   ├── user.py
│   ├── consultant.py
│   ├── service.py
│   ├── consultation.py
│   ├── project.py
│   └── notification.py
├── routes/
│   ├── auth.py
│   ├── services.py
│   ├── consultations.py
│   ├── projects.py
│   └── dashboard.py
└── utils/
    ├── auth.py
    └── file_handler.py
```

## Next Steps
1. Create authentication system
2. Setup database models
3. Implement API endpoints
4. Update frontend to use APIs
5. Add dashboard components
6. Test complete integration