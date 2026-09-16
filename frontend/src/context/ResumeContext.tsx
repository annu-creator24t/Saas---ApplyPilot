"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import { Resume } from "@/types/resume";
import { ATSAnalysis } from "@/types/analysis";
import * as ResumeService from "@/services/resume.service";
import { useAuthContext } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/utils/errors";

interface ResumeContextType {
  resumes: Resume[];
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>;
  selectedResume: Resume | null;
  result: ATSAnalysis | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  setSelectedResume: (resume: Resume | null) => void;
  selectResumeById: (resumeId: string) => void;
  fetchResumes: () => Promise<Resume[]>;
  uploadResume: (file: File) => Promise<Resume | null>;
  deleteResume: (resumeId: string) => Promise<boolean>;
  downloadResume: (resumeId: string, filename: string) => Promise<void>;
  setResult: React.Dispatch<React.SetStateAction<ATSAnalysis | null>>;
  clearAnalysis: () => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResumeState] = useState<Resume | null>(null);
  const [result, setResult] = useState<ATSAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSelectedResume = useCallback((resume: Resume | null) => {
    setSelectedResumeState(resume);
    if (resume?.resume_id) {
      localStorage.setItem("selected_resume_id", resume.resume_id);
    }
  }, []);

  const selectResumeById = useCallback(
    (resumeId: string) => {
      const found = resumes.find((r) => r.resume_id === resumeId);
      if (found) {
        setSelectedResume(found);
      }
    },
    [resumes, setSelectedResume]
  );

  const fetchResumes = useCallback(async (): Promise<Resume[]> => {
    if (!isAuthenticated) return [];
    try {
      setLoading(true);
      setError(null);
      const res = await ResumeService.getUserResumes();
      const loadedResumes = res?.data || [];
      setResumes(loadedResumes);

      if (loadedResumes.length > 0) {
        const savedId = typeof window !== "undefined" ? localStorage.getItem("selected_resume_id") : null;
        const matchingResume = savedId ? loadedResumes.find((r) => r.resume_id === savedId) : null;
        if (matchingResume) {
          setSelectedResumeState(matchingResume);
        } else {
          // Default to most recently uploaded/analyzed resume
          setSelectedResumeState(loadedResumes[0]);
          localStorage.setItem("selected_resume_id", loadedResumes[0].resume_id);
        }
      } else {
        setSelectedResumeState(null);
      }

      return loadedResumes;
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        console.error("Failed to load user resumes:", err);
      }
      setError(getApiErrorMessage(err, "Unable to load resumes. Please try again."));
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const uploadResume = useCallback(
    async (file: File): Promise<Resume | null> => {
      try {
        setUploading(true);
        setError(null);
        const response = await ResumeService.uploadResume(file);
        const newResume = response?.data;
        if (newResume?.resume_id) {
          const updatedResumes = await fetchResumes();
          const newlyAdded = updatedResumes.find((r) => r.resume_id === newResume.resume_id) || newResume;
          setSelectedResume(newlyAdded);
          return newlyAdded;
        }
        return null;
      } catch (err: any) {
        const msg = getApiErrorMessage(err, "Failed to upload resume. Please try again.");
        setError(msg);
        throw new Error(msg);
      } finally {
        setUploading(false);
      }
    },
    [fetchResumes, setSelectedResume]
  );

  const deleteResume = useCallback(
    async (resumeId: string): Promise<boolean> => {
      try {
        setError(null);
        await ResumeService.deleteResume(resumeId);
        const updatedResumes = await fetchResumes();
        if (selectedResume?.resume_id === resumeId) {
          if (updatedResumes.length > 0) {
            setSelectedResume(updatedResumes[0]);
          } else {
            setSelectedResume(null);
            localStorage.removeItem("selected_resume_id");
          }
        }
        return true;
      } catch (err: any) {
        const msg = getApiErrorMessage(err, "Failed to delete resume.");
        setError(msg);
        return false;
      }
    },
    [fetchResumes, selectedResume, setSelectedResume]
  );

  const downloadResume = useCallback(
    async (resumeId: string, filename: string) => {
      await ResumeService.downloadResumeFile(resumeId, filename);
    },
    []
  );

  function clearAnalysis() {
    setResult(null);
  }

  return (
    <ResumeContext.Provider
      value={{
        resumes,
        setResumes,
        selectedResume,
        result,
        loading,
        uploading,
        error,
        setSelectedResume,
        selectResumeById,
        fetchResumes,
        uploadResume,
        deleteResume,
        downloadResume,
        setResult,
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
    throw new Error("useResume must be used inside ResumeProvider");
  }
  return context;
}