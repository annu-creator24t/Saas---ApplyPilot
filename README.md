# ApplyPilot — AI-Powered Job Application Platform

ApplyPilot is an end-to-end AI career assistant platform designed to automate and optimize the modern job application journey.

---

## Features

- 🚀 **AI Job Description & ATS Matcher**: Compare your resume against any job description with Google Gemini AI to get an instant ATS match score, matched skills, missing skills, and tailored suggestions.
- 💼 **Application Tracker**: Organize your job pipeline with status tags (Bookmarked, Applied, Interviewing, Offer, Rejected), interview dates, and notes.
- 📄 **Resume Hub**: Upload, store, and manage master PDF/DOCX resumes with text extraction.
- 🧩 **Chrome Extension (Manifest V3)**: Auto-detect job postings on LinkedIn, Indeed, Glassdoor, Greenhouse, and Lever, run AI analysis in 1 click, and save applications directly to your dashboard.
- ✍️ **Cover Letter & Interview Prep**: AI-powered cover letter generator and interview practice modules.

---

## Project Structure

```text
ApplyPilot/
├── backend/          # FastAPI REST API + MongoDB + Gemini AI
├── frontend/         # Next.js 16 + React 19 + Tailwind CSS Web Application
├── extension/        # Chrome Extension (Manifest V3 + Vite + React)
├── README.md         # Master README
└── ARCHITECTURE.md   # Architectural Specifications
```

---

## Setup & Running Locally

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+
- MongoDB instance (Atlas or local)
- Gemini AI API Key

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET_KEY, and GEMINI_API_KEY in .env

# Run FastAPI server
python run.py
```
Backend will start at `http://localhost:8000`. API Docs available at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL, NEXT_PUBLIC_POSTHOG_KEY, and NEXT_PUBLIC_POSTHOG_HOST in .env.local

# Run development server
npm run dev
```
Frontend will start at `http://localhost:3000`.

---

## Analytics (PostHog Integration)

ApplyPilot uses a privacy-first, minimal PostHog integration solely to measure successful account creations. All automatic data capture (pageviews, session recordings, click autocapture) is disabled.

### Required Environment Variables

Add the following environment variables to `frontend/.env.local` (local) and your Vercel Project Settings (production):

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key | `phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host / ingestion URL | `https://us.i.posthog.com` or `https://eu.i.posthog.com` |

### Tracked Event

- **Event Name**: `signup_completed`
- **Trigger**: Emitted strictly after a user's registration request succeeds and receives a valid user ID from the backend.
- **Distinct ID**: The user's stable internal `user_id`.
- **Payload Properties**:
  ```json
  {
    "user_id": "<internal_user_id>"
  }
  ```
- **Privacy & Safety Guarantees**:
  - No passwords, JWT tokens, refresh tokens, resumes, emails, or sensitive data are transmitted.
  - Analytics failures are caught non-blockingly, ensuring signup and user authentication never fail due to PostHog.

### Vercel Deployment Configuration

1. In the Vercel Dashboard, go to your ApplyPilot frontend project.
2. Navigate to **Settings** > **Environment Variables**.
3. Add:
   - `NEXT_PUBLIC_POSTHOG_KEY` with your PostHog Project API Key.
   - `NEXT_PUBLIC_POSTHOG_HOST` with your PostHog instance host (e.g., `https://us.i.posthog.com`).
4. Trigger a new deployment or push to your repository to apply the changes.

---

### 3. Browser Extension Setup

```bash
cd extension

# Install dependencies
npm install

# Build Chrome extension
npm run build
```

#### Load into Chrome:
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and select the `extension/dist` folder.
4. Click the ApplyPilot icon on any job page to detect jobs and analyze ATS fit!

---

## License

MIT License. Built with ❤️ for job seekers worldwide.
