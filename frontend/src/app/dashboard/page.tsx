import ResumeAnalyzer from "@/components/resume/ResumeAnalyzer";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-4xl font-bold">
          Resume Analyzer
        </h1>

        <p className="mt-3 text-slate-600">
          Upload your resume, analyze your ATS score, and receive AI-powered
          suggestions to improve your chances of getting shortlisted.
        </p>
      </div>

      <ResumeAnalyzer />
    </div>
  );
}