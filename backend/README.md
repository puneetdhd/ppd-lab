# 📚 Online Marks Entry & Result Management System — Backend

A production-ready REST API built with **Node.js + TypeScript + Express + MongoDB (Mongoose) + JWT**.

---

## 🏗️ Architecture

This project follows a strict **4-layer architecture**:

```
HTTP Request
     ↓
  Routes          — URL definitions + middleware chain
     ↓
  Controllers     — Parse & validate request, call service, send response
     ↓
  Services        — Business logic, orchestration, error throwing
     ↓
  Repositories    — Raw DB access via Mongoose (no logic)
     ↓
  Models          — Mongoose schemas + TypeScript interfaces
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts                   # MongoDB connection
│   │   └── env.ts                  # Zod-validated environment variables
│   ├── models/                     # Mongoose schemas + TS interfaces
│   │   ├── User.model.ts
│   │   ├── Branch.model.ts
│   │   ├── Batch.model.ts
│   │   ├── Student.model.ts
│   │   ├── Teacher.model.ts
│   │   ├── Subject.model.ts
│   │   ├── TeachingAssignment.model.ts
│   │   ├── Mark.model.ts
│   │   └── Feedback.model.ts
│   ├── repositories/               # DB queries only — no business logic
│   │   ├── user.repository.ts
│   │   ├── branch.repository.ts
│   │   ├── batch.repository.ts
│   │   ├── student.repository.ts
│   │   ├── teacher.repository.ts
│   │   ├── subject.repository.ts
│   │   ├── assignment.repository.ts
│   │   ├── mark.repository.ts
│   │   └── feedback.repository.ts
│   ├── services/                   # Business logic + orchestration
│   │   ├── auth.service.ts
│   │   ├── branch.service.ts
│   │   ├── batch.service.ts
│   │   ├── subject.service.ts
│   │   ├── teacher.service.ts
│   │   ├── student.service.ts
│   │   ├── assignment.service.ts
│   │   ├── mark.service.ts
│   │   ├── analysis.service.ts
│   │   ├── feedback.service.ts
│   │   └── report.service.ts
│   ├── controllers/                # HTTP request/response handling
│   │   ├── auth.controller.ts
│   │   ├── branch.controller.ts
│   │   ├── batch.controller.ts
│   │   ├── subject.controller.ts
│   │   ├── teacher.controller.ts
│   │   ├── student.controller.ts
│   │   ├── assignment.controller.ts
│   │   ├── mark.controller.ts
│   │   ├── analysis.controller.ts
│   │   ├── feedback.controller.ts
│   │   └── report.controller.ts
│   ├── routes/                     # Express routers + role guards
│   │   ├── auth.routes.ts
│   │   ├── branch.routes.ts
│   │   ├── batch.routes.ts
│   │   ├── subject.routes.ts
│   │   ├── teacher.routes.ts
│   │   ├── student.routes.ts
│   │   ├── assignment.routes.ts
│   │   ├── mark.routes.ts
│   │   ├── analysis.routes.ts
│   │   ├── feedback.routes.ts
│   │   └── report.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── role.middleware.ts      # Role-based access guard
│   │   └── error.middleware.ts     # Global error handler
│   ├── utils/
│   │   ├── AppError.ts             # Custom error class
│   │   ├── asyncHandler.ts         # Async route wrapper
│   │   ├── grades.ts               # Grade calculation logic
│   │   └── csv.ts                  # CSV export utility
│   ├── types/
│   │   └── express.d.ts            # Augments Express Request with req.user
│   └── index.ts                    # App entry point
├── seed/
│   └── seed.ts                     # Sample data seeder
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ Data Model

### Entity Relationships

```
Branch ──< Batch ──< Student >── User
                 └──< TeachingAssignment >── Teacher >── User
                                         └──< Mark >── Student
                          Subject ──────────┘
Feedback: Student → Teacher + Subject
```

### Mark Components (Total = 100)

| Component  | Max Marks |
|------------|-----------|
| Mid Exam   | 60        |
| Quiz       | 15        |
| Assignment | 15        |
| Attendance | 10        |
| **Total**  | **100**   |

### Grade Scale

| Total  | Grade |
|--------|-------|
| 90–100 | O     |
| 80–89  | E     |
| 70–79  | A     |
| 60–69  | B     |
| 50–59  | C     |
| 40–49  | D     |
| < 40   | F     |

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js ≥ 18
- MongoDB running locally (`mongodb://localhost:27017`) or MongoDB Atlas URI

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

`.env` example:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/marks_result_db
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Seed the database (optional but recommended)

```bash
npm run seed
```

This creates:
- 1 Admin account
- 3 Branches (IT, CSE, ECE)
- 3 Batches (IT 2024–2028, IT 2023–2027, CSE 2024–2028)
- 5 Subjects
- 3 Teachers
- 10 Students
- 3 Teaching Assignments
- Sample marks and feedback

**Seeded credentials:**

| Role    | Email              | Password    |
|---------|--------------------|-------------|
| Admin   | admin@ppd.edu      | admin123    |
| Teacher | ramesh@ppd.edu     | teacher123  |
| Teacher | sunita@ppd.edu     | teacher123  |
| Student | s1@ppd.edu         | student123  |
| Student | s6@ppd.edu         | student123  |

### 5. Start the server

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

Server starts at: `http://localhost:5000`

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected endpoints require:
```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint        | Access | Description      |
|--------|-----------------|--------|------------------|
| POST   | /auth/login     | Public | Login, get JWT   |

**Request:**
```json
{ "email": "admin@ppd.edu", "password": "admin123" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": { "id": "...", "name": "Super Admin", "role": "admin" }
  }
}
```

---

### Branches (Admin only)

| Method | Endpoint          | Description           |
|--------|-------------------|-----------------------|
| POST   | /branches         | Create branch         |
| GET    | /branches         | List all branches     |
| GET    | /branches/:id     | Get branch by ID      |
| PUT    | /branches/:id     | Update branch         |
| DELETE | /branches/:id     | Delete branch         |

---

### Batches (Admin only)

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /batches                        | Create batch             |
| GET    | /batches                        | List all batches         |
| GET    | /batches/:id                    | Get batch by ID          |
| GET    | /batches/branch/:branchId       | Get batches by branch    |
| PUT    | /batches/:id                    | Update batch             |
| DELETE | /batches/:id                    | Delete batch             |

**Create Batch body:**
```json
{ "branch_id": "<objectId>", "start_year": 2024, "graduation_year": 2028 }
```

---

### Subjects

| Method | Endpoint          | Access        | Description       |
|--------|-------------------|---------------|-------------------|
| POST   | /subjects         | Admin         | Create subject    |
| GET    | /subjects         | All           | List subjects     |
| GET    | /subjects/:id     | All           | Get subject       |
| PUT    | /subjects/:id     | Admin         | Update subject    |
| DELETE | /subjects/:id     | Admin         | Delete subject    |

---

### Teachers

| Method | Endpoint        | Access  | Description           |
|--------|-----------------|---------|-----------------------|
| POST   | /teachers       | Admin   | Create teacher + user |
| GET    | /teachers       | Admin   | List all teachers     |
| GET    | /teachers/me    | Teacher | Own profile           |
| GET    | /teachers/:id   | Admin   | Get teacher by ID     |

---

### Students

| Method | Endpoint                    | Access         | Description             |
|--------|-----------------------------|----------------|-------------------------|
| POST   | /students                   | Admin          | Create student + user   |
| GET    | /students                   | Admin          | List all students       |
| GET    | /students/me                | Student        | Own profile             |
| GET    | /students/:id               | Admin          | Get student by ID       |
| GET    | /students/batch/:batchId    | Admin, Teacher | Students in batch       |

---

### Teaching Assignments

| Method | Endpoint                                     | Access         | Description              |
|--------|----------------------------------------------|----------------|--------------------------|
| POST   | /assignments                                 | Admin          | Assign teacher           |
| GET    | /assignments                                 | Admin          | All assignments          |
| GET    | /assignments/my/assignments                  | Teacher        | Teacher's own assignments|
| GET    | /assignments/:id                             | Admin, Teacher | Get assignment           |
| GET    | /assignments/batch/:batchId/semester/:sem    | All auth       | Filter by batch+semester |

**Assign teacher body:**
```json
{
  "teacher_id": "<objectId>",
  "subject_id": "<objectId>",
  "batch_id": "<objectId>",
  "semester": 1
}
```

---

### Marks

| Method | Endpoint                             | Access         | Description              |
|--------|--------------------------------------|----------------|--------------------------|
| POST   | /marks                               | Teacher        | Enter marks              |
| PUT    | /marks/:id                           | Teacher        | Update marks             |
| GET    | /marks/results                       | Student        | Own results              |
| GET    | /marks/assignment/:assignmentId      | Teacher, Admin | All marks for assignment |

**Enter marks body:**
```json
{
  "student_id": "<objectId>",
  "assignment_id": "<objectId>",
  "mid": 45,
  "quiz": 12,
  "assignment": 13,
  "attendance": 9
}
```
> `total` and `grade` are auto-computed.

---

### Analysis

| Method | Endpoint                     | Access         | Description                    |
|--------|------------------------------|----------------|--------------------------------|
| GET    | /analysis/my                 | Teacher        | Analysis for all my subjects   |
| GET    | /analysis/:assignmentId      | Teacher, Admin | Analysis for one assignment    |

**Response sample:**
```json
{
  "subject": "Object Oriented Programming",
  "batch": "Information Technology 2024–2028",
  "total_students": 5,
  "above_90": 1,
  "between_50_90": 2,
  "failed": 1,
  "grade_distribution": { "O": 1, "E": 0, "A": 0, "B": 1, "C": 1, "D": 0, "F": 1 },
  "average_total": 65.2
}
```

---

### Feedback

| Method | Endpoint            | Access  | Description                    |
|--------|---------------------|---------|--------------------------------|
| POST   | /feedback           | Student | Submit feedback                |
| GET    | /feedback/my        | Student | View feedback I submitted      |
| GET    | /feedback/received  | Teacher | Feedback received + avg rating |
| GET    | /feedback           | Admin   | All feedback                   |

---

### Reports

| Method | Endpoint                         | Access         | Description                  |
|--------|----------------------------------|----------------|------------------------------|
| GET    | /reports/subject/:assignmentId   | Admin, Teacher | Subject-wise result          |
| GET    | /reports/subject/:assignmentId?format=csv | Admin, Teacher | Download as CSV    |
| GET    | /reports/batch/:batchId          | Admin, Teacher | Batch-wise report            |
| GET    | /reports/grades/:assignmentId    | Admin, Teacher | Grade distribution           |

---

## 🔒 Role Summary

| Feature              | Admin | Teacher | Student |
|----------------------|-------|---------|---------|
| Manage Branches      | ✅    | ❌      | ❌      |
| Manage Batches       | ✅    | ❌      | ❌      |
| Manage Subjects      | ✅    | ❌      | ❌      |
| Add Teachers         | ✅    | ❌      | ❌      |
| Add Students         | ✅    | ❌      | ❌      |
| Assign Teachers      | ✅    | ❌      | ❌      |
| Enter/Update Marks   | ❌    | ✅      | ❌      |
| View Analysis        | ✅    | ✅      | ❌      |
| View Reports         | ✅    | ✅      | ❌      |
| View Own Results     | ❌    | ❌      | ✅      |
| Submit Feedback      | ❌    | ❌      | ✅      |
| View Feedback        | ✅    | ✅*     | ✅*     |

*Teachers see their own received feedback; students see what they submitted.

---

## 🛠️ Design Decisions

1. **Repository pattern** — All Mongoose queries are isolated in repositories. Services never call Mongoose directly. This makes swapping the DB layer trivial.

2. **Service layer owns business logic** — Grade calculation, duplicate checks, FK validation all live in services. Controllers are kept thin.

3. **Zod for validation** — Request bodies are validated with Zod schemas in controllers. Errors bubble up to the global error handler which formats them consistently.

4. **Computed fields** — `total` and `grade` in marks are computed in `mark.service.ts` before saving, not handled by Mongoose hooks, giving the service layer full control.

5. **Unique indexes** — `TeachingAssignment` has a compound unique index on `(teacher_id, subject_id, batch_id, semester)` to prevent duplicate assignments at the DB level.

6. **bcrypt in User model pre-save hook** — Ensures passwords are always hashed regardless of how the User is created.
