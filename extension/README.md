# ApplyPilot Chrome Extension (Manifest V3)

The ApplyPilot Chrome Extension is an AI job copilot that extracts job postings, calculates ATS match scores against your resume, and lets you track applications with 1-click on any webpage.

---

## 🚀 How to Build and Install in Google Chrome

### 1. Build the Extension
Run the build command inside the `extension/` folder:
```bash
cd extension
npm run build
```
This generates the extension distribution bundle inside the `extension/dist` folder.

### 2. Load into Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions` in the address bar.
2. Enable **Developer mode** using the toggle switch in the top right corner.
3. Click **Load unpacked** in the top left corner.
4. Select the `extension/dist` folder (`c:\Users\ANNU TIWARI\Desktop\ApplyPilot\extension\dist`).
5. Pin the **ApplyPilot — AI Job Copilot** extension to your extension toolbar.

---

## ⚡ Features

1. **Automated Job Detection**: Detects job title, company, location, and job description from LinkedIn, Indeed, Naukri, Glassdoor, Greenhouse, Lever, Google Careers, Amazon Jobs, TCS, Infosys, Tech Mahindra, and any generic job site.
2. **Instant Match Score**: Calculates ATS match score (%) comparing the target job description with your uploaded resume.
3. **1-Click Application Tracking**: Save jobs directly into your ApplyPilot Web App dashboard.
4. **Website Quick Redirect**: Click **Website ↗** or any of the redirect buttons in the popup to jump directly to the ApplyPilot Web App (`http://localhost:3000`).
