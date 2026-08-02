"use client";

import { useState } from "react";

import { useResume } from "@/context/ResumeContext";

import CopyButton from "@/components/common/CopyButton";

import {
  generateResumeImprovement,
} from "@/services/resume-improvement.service";

import { ResumeImprovement } from "@/types/resume-improvement";

export default function ResumeOptimizerPage() {

  const { selectedResume } = useResume();

  const [jobDescription, setJobDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<ResumeImprovement | null>(null);

  async function handleGenerate() {

    if (!selectedResume) {
      alert("Please upload and select a resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter a job description.");
      return;
    }

    try {

      setLoading(true);

      const response =
        await generateResumeImprovement({

          resume_id:
            selectedResume.resume_id,

          job_description:
            jobDescription,

        });

      setResult(response.data);

    } catch (error: any) {

      console.error(error);

      alert(
        error?.response?.data?.message ??
        "Failed to generate resume improvement."
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-bold">
          ✨ Resume Optimizer
        </h1>

        <p className="mt-2 text-slate-500">
          Improve your resume using AI.
        </p>

      </div>

      <div className="rounded-2xl bg-white p-6 shadow">

        <label className="font-medium">
          Job Description
        </label>

        <textarea

          rows={8}

          value={jobDescription}

          onChange={(e)=>
            setJobDescription(
              e.target.value
            )
          }

          className="mt-3 w-full rounded-xl border p-4"

          placeholder="Paste Job Description..."

        />

        <button

          onClick={handleGenerate}

          disabled={loading}

          className="mt-5 rounded-xl bg-cyan-600 px-6 py-3 text-white hover:bg-cyan-700"

        >

          {loading
            ? "Generating..."
            : "Generate Resume Improvement"}

        </button>

      </div>

      {result && (

        <div className="space-y-8">

          {/* Professional Summary */}

          <div className="rounded-2xl bg-white p-8 shadow">

            <div className="flex justify-between">

              <h2 className="text-2xl font-bold">
                Professional Summary
              </h2>

              <CopyButton
                text={result.professional_summary}
              />

            </div>

            <p className="mt-5 whitespace-pre-wrap leading-8">

              {result.professional_summary}

            </p>

          </div>

          {/* Skills */}

          <div className="rounded-2xl bg-white p-8 shadow">

            <h2 className="text-2xl font-bold">

              Skills

            </h2>

            <ul className="mt-6 list-disc space-y-3 pl-6">

              {result.skills.map((skill,index)=>(
                <li key={index}>
                  {skill}
                </li>
              ))}

            </ul>

          </div>

          {/* Experience */}

          <div className="rounded-2xl bg-white p-8 shadow">

            <div className="flex justify-between">

              <h2 className="text-2xl font-bold">

                Experience

              </h2>

              <CopyButton
                text={result.experience}
              />

            </div>

            <p className="mt-5 whitespace-pre-wrap leading-8">

              {result.experience}

            </p>

          </div>

          {/* Projects */}

          <div className="rounded-2xl bg-white p-8 shadow">

            <div className="flex justify-between">

              <h2 className="text-2xl font-bold">

                Projects

              </h2>

              <CopyButton
                text={result.projects}
              />

            </div>

            <p className="mt-5 whitespace-pre-wrap leading-8">

              {result.projects}

            </p>

          </div>

          {/* Recommendations */}

          <div className="rounded-2xl bg-white p-8 shadow">

            <h2 className="text-2xl font-bold">

              Recommendations

            </h2>

            <ul className="mt-6 list-disc space-y-3 pl-6">

              {result.recommendations.map((item,index)=>(
                <li key={index}>
                  {item}
                </li>
              ))}

            </ul>

          </div>

        </div>

      )}

    </div>

  );

}