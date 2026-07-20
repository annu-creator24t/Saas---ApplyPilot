import type { Job } from "../types/job";

interface Props {
  job: Job;
}

export default function JobCard({ job }: Props) {
  return (
    <div className="rounded-2xl bg-white shadow-lg p-5">
      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
        LinkedIn Job Detected
      </span>

      <h2 className="mt-4 text-xl font-bold">
        {job.role}
      </h2>

      <p className="text-gray-500">
        {job.company} • {job.location}
      </p>
    </div>
  );
}