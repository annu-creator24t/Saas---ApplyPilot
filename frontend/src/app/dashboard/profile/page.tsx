"use client";

export default function ProfilePage() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          👤 My Profile
        </h1>

        <p className="mt-2 text-slate-500">
          View your profile, analysis history, and account settings.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <h2 className="mb-4 text-2xl font-bold">
          Profile Overview
        </h2>

        <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
          Profile features will appear here after authentication is implemented.
        </div>

      </div>

    </div>
  );
}