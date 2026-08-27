"use client";

import { useState, useCallback, memo } from "react";

function CopyButtonComponent({
  text,
}: {
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  }, [text]);

  return (
    <button
      onClick={copyText}
      type="button"
      className="rounded-lg bg-cyan-600 px-4 py-2 text-white transition hover:bg-cyan-700"
    >
      {copied ? "✅ Copied" : "📋 Copy"}
    </button>
  );
}

const CopyButton = memo(CopyButtonComponent);
export default CopyButton;