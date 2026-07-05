"use client";

import { useState } from "react";

export default function CopyButton({
  text,
}: {
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    await navigator.clipboard.writeText(text);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <button
      onClick={copyText}
      className="rounded-lg bg-cyan-600 px-4 py-2 text-white transition hover:bg-cyan-700"
    >
      {copied ? "✅ Copied" : "📋 Copy"}
    </button>
  );
}