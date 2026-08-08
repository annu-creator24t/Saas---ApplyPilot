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

# Run development server
npm run dev
```
Frontend will start at `http://localhost:3000`.

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
