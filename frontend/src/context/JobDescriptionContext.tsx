"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export interface SavedJobDescription {
  id: string;
  job_title: string;
  company_name: string;
  job_description: string;
  created_at: string;
}

interface JobDescriptionContextType {
  jobDescriptions: SavedJobDescription[];
  selectedJobDescription: SavedJobDescription | null;
  setSelectedJobDescription: (jd: SavedJobDescription | null) => void;
  selectJobDescriptionById: (id: string) => void;
  saveJobDescription: (
    job_title: string,
    company_name: string,
    job_description: string
  ) => SavedJobDescription;
  deleteJobDescription: (id: string) => void;
  updateJobDescription: (
    id: string,
    job_title: string,
    company_name: string,
    job_description: string
  ) => void;
}

const JobDescriptionContext = createContext<JobDescriptionContextType | null>(
  null
);

const LOCAL_STORAGE_LIST_KEY = "applypilot_saved_jds";
const LOCAL_STORAGE_ACTIVE_KEY = "applypilot_selected_jd_id";

export function JobDescriptionProvider({ children }: { children: ReactNode }) {
  const [jobDescriptions, setJobDescriptions] = useState<SavedJobDescription[]>([]);
  const [selectedJobDescription, setSelectedJobDescriptionState] =
    useState<SavedJobDescription | null>(null);

  // Load saved JDs from localStorage on mount
  useEffect(() => {
    try {
      const savedListJson = localStorage.getItem(LOCAL_STORAGE_LIST_KEY);
      const activeId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY);
      let list: SavedJobDescription[] = [];

      if (savedListJson) {
        list = JSON.parse(savedListJson);
        setJobDescriptions(list);
      }

      if (list.length > 0) {
        const found = activeId ? list.find((item) => item.id === activeId) : null;
        if (found) {
          setSelectedJobDescriptionState(found);
        } else {
          setSelectedJobDescriptionState(list[0]);
          localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, list[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load saved job descriptions:", e);
    }
  }, []);

  const setSelectedJobDescription = useCallback((jd: SavedJobDescription | null) => {
    setSelectedJobDescriptionState(jd);
    if (jd?.id) {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, jd.id);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_KEY);
    }
  }, []);

  const selectJobDescriptionById = useCallback(
    (id: string) => {
      const found = jobDescriptions.find((j) => j.id === id);
      if (found) {
        setSelectedJobDescription(found);
      }
    },
    [jobDescriptions, setSelectedJobDescription]
  );

  const saveJobDescription = useCallback(
    (job_title: string, company_name: string, job_description: string): SavedJobDescription => {
      const newJd: SavedJobDescription = {
        id: `jd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        job_title: job_title.trim() || "Target Job Role",
        company_name: company_name.trim() || "Target Company",
        job_description: job_description.trim(),
        created_at: new Date().toISOString(),
      };

      setJobDescriptions((prev) => {
        const updated = [newJd, ...prev];
        localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(updated));
        return updated;
      });

      setSelectedJobDescription(newJd);
      return newJd;
    },
    [setSelectedJobDescription]
  );

  const updateJobDescription = useCallback(
    (id: string, job_title: string, company_name: string, job_description: string) => {
      setJobDescriptions((prev) => {
        const updated = prev.map((j) =>
          j.id === id
            ? {
                ...j,
                job_title: job_title.trim() || j.job_title,
                company_name: company_name.trim() || j.company_name,
                job_description: job_description.trim() || j.job_description,
              }
            : j
        );
        localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(updated));
        
        if (selectedJobDescription?.id === id) {
          const updatedItem = updated.find((item) => item.id === id);
          if (updatedItem) setSelectedJobDescriptionState(updatedItem);
        }
        return updated;
      });
    },
    [selectedJobDescription]
  );

  const deleteJobDescription = useCallback(
    (id: string) => {
      setJobDescriptions((prev) => {
        const updated = prev.filter((j) => j.id !== id);
        localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(updated));

        if (selectedJobDescription?.id === id) {
          if (updated.length > 0) {
            setSelectedJobDescription(updated[0]);
          } else {
            setSelectedJobDescription(null);
          }
        }
        return updated;
      });
    },
    [selectedJobDescription, setSelectedJobDescription]
  );

  return (
    <JobDescriptionContext.Provider
      value={{
        jobDescriptions,
        selectedJobDescription,
        setSelectedJobDescription,
        selectJobDescriptionById,
        saveJobDescription,
        deleteJobDescription,
        updateJobDescription,
      }}
    >
      {children}
    </JobDescriptionContext.Provider>
  );
}

export function useJobDescription() {
  const context = useContext(JobDescriptionContext);
  if (!context) {
    throw new Error(
      "useJobDescription must be used inside JobDescriptionProvider"
    );
  }
  return context;
}
