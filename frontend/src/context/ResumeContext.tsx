"use client";

import { createContext, useContext, useState } from "react";

type ResumeContextType = {
  result: any;
  setResult: (value: any) => void;

  resumeText: string;
  setResumeText: (value: string) => void;

  jobDescription: string;
  setJobDescription: (value: string) => void;
};

const ResumeContext =
  createContext<ResumeContextType | null>(null);

export function ResumeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [result, setResult] = useState<any>(null);

  const [resumeText, setResumeText] =
    useState("");

  const [jobDescription, setJobDescription] =
    useState("");

  return (
    <ResumeContext.Provider
      value={{
        result,
        setResult,

        resumeText,
        setResumeText,

        jobDescription,
        setJobDescription,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);

  if (!context)
    throw new Error("ResumeContext missing");

  return context;
}