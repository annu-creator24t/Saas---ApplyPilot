This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set up environment variables:

```bash
cp .env.example .env.local
```

Configure your API URL and PostHog credentials in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Analytics & PostHog Setup

ApplyPilot uses a lightweight, non-blocking PostHog integration strictly for tracking successful user registrations.

### Environment Variables
- `NEXT_PUBLIC_POSTHOG_KEY`: PostHog Project API Key
- `NEXT_PUBLIC_POSTHOG_HOST`: PostHog Host endpoint (default: `https://us.i.posthog.com`)

### Tracked Events
- **`signup_completed`**: Triggered only upon confirmed successful user registration.
- **Distinct ID**: `user_id` (Backend internal user ID).
- **Payload**:
  ```json
  {
    "user_id": "string"
  }
  ```

*Note: Auto-capture, session recordings, pageviews, and all sensitive data (passwords, tokens, resumes, emails) are strictly excluded.*

## Deploy on Vercel

1. Import the `frontend` repository to Vercel.
2. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`
3. Click **Deploy**.

