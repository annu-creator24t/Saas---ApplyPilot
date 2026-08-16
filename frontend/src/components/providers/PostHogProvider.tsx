"use client";

import { useEffect, ReactNode } from "react";
import { initPostHog } from "@/lib/posthog";

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}
