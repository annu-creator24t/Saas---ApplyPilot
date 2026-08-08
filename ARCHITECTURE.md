# ApplyPilot Architecture Documentation

ApplyPilot is an end-to-end, AI-powered job application management platform built for modern job seekers. It connects a high-performance FastAPI backend, a responsive Next.js web application, and a Chrome extension into a unified ecosystem.

---

## 1. System High-Level Architecture

```text
                    ┌───────────────────────────────┐
                    │          User Agent           │
                    └───────────────┬───────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
        ┌───────▼────────┐                    ┌─────────▼─────────┐
        │  Next.js 16    │                    │ Chrome Extension  │
        │  Web Application                    │   Manifest V3     │
        └───────┬────────┘                    └─────────┬─────────┘
                │                                       │
                └───────────────────┬───────────────────┘
                                    │  HTTPS / REST APIs (JWT)
                                    │
                            ┌───────▼───────┐
                            │    FastAPI    │
                            │    Backend    │
                            └───────┬───────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
       ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
       │   MongoDB   │       │  Gemini AI  │       │ Cloudinary  │
       │  Database   │       │   Service   │       │ File Storage│
       └─────────────┘       └─────────────┘       └─────────────┘
```

---

## 2. Component Specifications

### 2.1 Backend (`/backend`)
- **Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB (Async Motor driver)
- **AI Service**: Google Gemini API (`gemini-2.5-flash` / `gemini-3.6-flash`)
- **File Storage**: Cloudinary (with fallback to local storage)
- **Auth**: JWT (HS256) with OAuth2 form and JSON request compatibility
- **Key Modules**:
  - `app/api/auth.py`: Registration, Login, Token generation
  - `app/api/job.py`: Job description matching & AI ATS evaluation
  - `app/api/applications.py`: Job application tracking & pipeline management
  - `app/api/resume.py`: Resume upload, PyMuPDF text extraction, deletion
  - `app/api/dashboard.py`: Consolidated user analytics & activity aggregation

### 2.2 Frontend (`/frontend`)
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide Icons + Custom Modern Dark Design Tokens
- **State & Client Libraries**: Axios, React Dropzone, AuthContext
- **Key Pages**:
  - `/dashboard`: Command Center overview with metrics, active resume, recent activity
  - `/dashboard/applications`: Application Tracker (Kanban / Filterable List view)
  - `/dashboard/resumes`: Resume Hub for PDF/DOCX master resume management
  - `/dashboard/resume-optimizer`: AI Job Matcher with side-by-side skill gap comparison

### 2.3 Browser Extension (`/extension`)
- **Specification**: Chrome Extension Manifest V3
- **Framework**: Vite + React 19 + TypeScript
- **Background Worker**: `background.js` handles Chrome Storage JWT tokens and API proxying
- **Content Scripts**: `content.js` automatically detects & extracts job metadata (title, company, location, URL, description) from LinkedIn, Indeed, Glassdoor, Greenhouse, and Lever.
- **Popup UI**: Interactive popup with live ATS scoring, skill breakdown, and 1-click **Track Application** button.

---

## 3. Data Flow & Security

1. **User Authentication**:
   - Frontend or Extension posts credentials to `/auth/login`.
   - Backend validates hashed password using bcrypt and returns JWT access and refresh tokens.
   - Credentials and password hashes are strictly scrubbed from logs.

2. **Job Analysis Workflow**:
   - Extension extracts job posting details from active tab DOM (or user pastes text in Web App).
   - Client sends payload to `POST /api/job/analyze` with `Authorization: Bearer <token>`.
   - Backend loads candidate's master resume, formats a structured prompt for Gemini AI, and returns ATS match percentage, matched skills, missing skills, and tailoring suggestions.

3. **Application Tracking Sync**:
   - User clicks **"1-Click Track Application"**.
   - Client posts to `POST /api/applications`.
   - Application is saved to MongoDB under the user's isolated `user_id`.
   - Web App Dashboard automatically reflects the updated pipeline count and activity log.
