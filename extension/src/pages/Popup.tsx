import Header from "../components/Header";
import JobCard from "../components/JobCard";
import ATSCard from "../components/ATSCard";
import SkillsCard from "../components/SkillsCard";
import ActionButtons from "../components/ActionButtons";

import useJob from "../hooks/useJob";

export default function Popup() {
  const { job, loading } = useJob();

  if (loading) {
    return (
      <div className="w-[380px] h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-[380px] h-screen flex items-center justify-center">
        No Job Found
      </div>
    );
  }

  return (
    <div className="w-[380px] min-h-screen bg-slate-100 p-5">
      <Header />

      <JobCard job={job} />

      <ATSCard score={job.atsScore} />

      <SkillsCard skills={job.missingSkills} />

      <ActionButtons />
    </div>
  );
}