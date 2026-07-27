"use client";

import { useRef, useState } from "react";

import { uploadResume } from "@/services/resume.service";

interface ResumeUploadProps {
  onUploadSuccess?: () => Promise<void> | void;
}

export default function ResumeUpload({
  onUploadSuccess,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setFile(selectedFile);
  }

  function resetForm() {
    setFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleUpload() {
    if (!file) {
      alert("Please choose a resume.");
      return;
    }

    try {
      setLoading(true);

      const response = await uploadResume(file);

      alert(response.message);

      resetForm();

      if (onUploadSuccess) {
        await onUploadSuccess();
      }
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ??
          "Failed to upload resume."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow">

      <h2 className="mb-4 text-xl font-bold">
        Upload Resume
      </h2>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-lg bg-slate-800 px-5 py-3 text-white"
        disabled={loading}
      >
        Choose Resume
      </button>

      {file && (
        <div className="mt-4 rounded-lg bg-slate-100 p-4">
          <p className="font-medium">
            📄 {file.name}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-4 w-full rounded-lg bg-cyan-600 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Resume"}
      </button>

    </div>
  );
}