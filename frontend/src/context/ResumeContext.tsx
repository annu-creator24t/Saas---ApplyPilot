"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import { Resume } from "@/types/resume";
import { ATSAnalysis } from "@/types/analysis";

interface ResumeContextType {
  resumes: Resume[];
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>;

  selectedResume: Resume | null;
  setSelectedResume: React.Dispatch<
    React.SetStateAction<Resume | null>
  >;

  result: ATSAnalysis | null;
  setResult: React.Dispatch<
    React.SetStateAction<ATSAnalysis | null>
  >;

  loading: boolean;
  setLoading: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  clearAnalysis: () => void;
}

const ResumeContext =
  createContext<ResumeContextType | null>(null);

export function ResumeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] =
    useState<Resume | null>(null);
  const [result, setResult] =
    useState<ATSAnalysis | null>(null);
  const [loading, setLoading] =
    useState(false);

  function clearAnalysis() {
    setResult(null);
  }

  return (
    <ResumeContext.Provider
      value={{
        resumes,
        setResumes,

        selectedResume,
        setSelectedResume,

        result,
        setResult,

        loading,
        setLoading,

        clearAnalysis,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);

  if (!context) {
    throw new Error(
      "useResume must be used inside ResumeProvider"
    );
  }

  return context;
}