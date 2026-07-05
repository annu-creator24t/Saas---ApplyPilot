import ResumeAnalyzer from "@/components/ResumeAnalyzer";

export default function DashboardPage() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-slate-800">
          Resume Analyzer
        </h1>

        <p className="mt-2 text-slate-500">
          Upload your resume and compare it against any job description using AI.
        </p>
      </div>

      <ResumeAnalyzer />

    </div>
  );
}