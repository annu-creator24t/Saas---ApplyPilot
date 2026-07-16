# 🚀 ApplyPilot AI - Backend (v1.0)

An AI-powered career assistant backend built using **FastAPI**, **MongoDB**, and **Google Gemini AI**.  
ApplyPilot helps users analyze resumes, generate personalized cover letters, prepare for interviews, and manage all AI-generated content through a secure dashboard.

---

# 📖 Project Overview

ApplyPilot AI is a SaaS-style backend application that simplifies the job application process using Artificial Intelligence.

The backend provides secure authentication, resume analysis, cover letter generation, interview question generation, answer evaluation, personalized dashboards, and complete history management.

Every feature is protected using JWT authentication, ensuring users can only access their own data.

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- Password Hashing using bcrypt
- JWT Authentication
- Protected Routes
- User Profile API

---

## 📄 Resume Analyzer

Upload a resume in PDF format and compare it against a job description.

The AI provides:

- ATS Score
- Match Score
- Strengths
- Missing Skills
- Resume Suggestions
- Optimized Resume Summary
- Improved Bullet Points
- Interview Questions based on Resume

All analyses are stored securely in MongoDB.

---

## ✉️ Cover Letter Generator

Generate personalized cover letters based on:

- Resume
- Job Description

Features:

- AI Generated Cover Letter
- Save to MongoDB
- View History
- View Individual Cover Letter
- Delete Cover Letter

---

## 🎤 Interview Preparation

Generate AI interview questions based on:

- Resume
- Job Description

Features:

- Interview Question Generation
- Save Interview Session
- Interview History
- View Interview
- Delete Interview

---

## 📝 Answer Evaluation

Evaluate interview answers using Google Gemini AI.

The AI reviews:

- Answer Quality
- Relevance
- Improvements
- Suggestions

---

## 📊 Dashboard

Personalized dashboard showing:

- Total Resume Analyses
- Total Cover Letters
- Total Interview Sessions
- Recent Activity

---

## 📚 History Management

Users can access their previous AI-generated content.

### Resume History

- View All Analyses
- View Individual Resume
- Delete Resume

### Cover Letter History

- View All Cover Letters
- View Individual Cover Letter
- Delete Cover Letter

### Interview History

- View All Interviews
- View Individual Interview
- Delete Interview

---

# 🏗 Project Architecture

```
Client
   │
   ▼
FastAPI Routes
   │
   ▼
Service Layer
   │
   ▼
MongoDB
   │
   ▼
Google Gemini AI
```

The project follows a layered architecture that separates:

- API Layer
- Business Logic
- Database Layer
- AI Integration
- Authentication

---

# 📂 Project Structure

```
backend/

│
├── app/
│   │
│   ├── api/
│   │      ├── auth.py
│   │      ├── resume.py
│   │      ├── cover_letter.py
│   │      ├── interview.py
│   │      ├── evaluate_answer.py
│   │      ├── dashboard.py
│   │      ├── profile.py
│   │      ├── router.py
│   │      │
│   │      └── history/
│   │             ├── resume_history.py
│   │             ├── cover_letter_history.py
│   │             └── interview_history.py
│   │
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── prompts/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   └── main.py
│
├── uploads/
├── requirements.txt
└── README.md
```

---

# ⚙️ Tech Stack

## Backend

- FastAPI

## Database

- MongoDB Atlas
- Motor (Async MongoDB Driver)

## AI

- Google Gemini API

## Authentication

- JWT
- OAuth2 Password Bearer
- bcrypt
- passlib

## Validation

- Pydantic

## PDF Processing

- PyMuPDF (fitz)

## Environment

- Python 3.10+

---

# 🔐 Authentication Flow

```
Register
      │
      ▼
Store User
      │
      ▼
Hash Password
      │
      ▼
Login
      │
      ▼
Verify Password
      │
      ▼
Generate JWT
      │
      ▼
Protected APIs
```

---

# 📄 Resume Analysis Flow

```
Upload PDF
      │
      ▼
Extract Resume Text
      │
      ▼
Generate AI Prompt
      │
      ▼
Gemini AI
      │
      ▼
Resume Analysis
      │
      ▼
Store in MongoDB
      │
      ▼
Return Response
```

---

# 📊 Dashboard Flow

```
Authenticate User
        │
        ▼
Resume Count
Cover Letter Count
Interview Count
        │
        ▼
Recent Activity
        │
        ▼
Dashboard Response
```

---

# 📌 REST APIs

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /register |
| POST | /login |
| GET | /profile |

---

## Resume

| Method | Endpoint |
|---------|----------|
| POST | /analyze |
| GET | /history/resumes |
| GET | /resume/{id} |
| DELETE | /resume/{id} |

---

## Cover Letter

| Method | Endpoint |
|---------|----------|
| POST | /generate-cover-letter |
| GET | /history/cover-letters |
| GET | /cover-letter/{id} |
| DELETE | /cover-letter/{id} |

---

## Interview

| Method | Endpoint |
|---------|----------|
| POST | /generate-interview |
| GET | /history/interviews |
| GET | /interview/{id} |
| DELETE | /interview/{id} |

---

## Interview Evaluation

| Method | Endpoint |
|---------|----------|
| POST | /evaluate-answer |

---

## Dashboard

| Method | Endpoint |
|---------|----------|
| GET | /dashboard |

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/annu-creator24t/Saas---ApplyPilot.git
```

Move into backend

```bash
cd backend
```

Create virtual environment

```bash
python -m venv venv
```

Activate virtual environment

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create a `.env` file

```env
GEMINI_API_KEY=YOUR_API_KEY

MONGODB_URL=YOUR_MONGODB_URL

DATABASE_NAME=applypilot_ai

SECRET_KEY=YOUR_SECRET_KEY

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Run server

```bash
uvicorn app.main:app --reload
```

Swagger Documentation

```
http://localhost:8000/docs
```

---

# 🗄 Database Collections

```
users

resume_analysis

cover_letters

interviews
```

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing
- Protected APIs
- User-specific Data Access
- Environment Variables
- MongoDB Atlas

---

# 🧪 API Testing

All APIs can be tested using:

- Swagger UI
- Postman

Swagger URL

```
http://localhost:8000/docs
```

---

# 🎯 Version 1.0 Completed Features

✅ Authentication

✅ Resume Analyzer

✅ Cover Letter Generator

✅ Interview Generator

✅ Answer Evaluation

✅ Dashboard

✅ Resume CRUD

✅ Cover Letter CRUD

✅ Interview CRUD

✅ History APIs

✅ JWT Protected Routes

---

# 🔮 Future Roadmap

- Frontend (Next.js + Tailwind CSS)
- Social Media Integration
- AI Career Chatbot
- Resume Versioning
- Email Notifications
- Docker
- CI/CD Pipeline
- Cloud Deployment
- Analytics Dashboard

---

# 👨‍💻 Developer

**Annu Tiwari**

B.Tech Computer Science & Engineering

IILM University, Greater Noida

GitHub: https://github.com/annu-creator24t

LinkedIn: https://www.linkedin.com/in/annu-tiwari/

---

# ⭐ Version

Current Version

```
v1.0.0
```

---