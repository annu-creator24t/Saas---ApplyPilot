"use client";

import { useRef, useState } from "react";

export default function ResumeUpload() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setFileName(file.name);
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-slate-700 p-8 text-center">

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black"
      >
        Upload Resume
      </button>

      {fileName && (
        <p className="mt-4 text-green-400">
          Selected: {fileName}
        </p>
      )}

    </div>
  );
}