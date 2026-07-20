import { useEffect, useState } from "react";
import { dummyJob } from "../data/dummyJob";
import type { Job } from "../types/job";
export default function useJob() {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporary: simulate API call
    setTimeout(() => {
      setJob(dummyJob);
      setLoading(false);
    }, 500);
  }, []);

  return {
    job,
    loading,
  };
}