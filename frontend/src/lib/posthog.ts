import posthog from "posthog-js";

let isInitialized = false;

/**
 * Initializes PostHog client strictly once in client-side environment.
 * Auto-capture, session recordings, pageviews, and pageleaves are explicitly disabled
 * to ensure only intended analytics events are captured.
 */
export const initPostHog = (): void => {
  if (typeof window === "undefined" || isInitialized) {
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (apiKey) {
    try {
      posthog.init(apiKey, {
        api_host: apiHost,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        person_profiles: "identified_only",
      });
      isInitialized = true;
    } catch (error) {
      console.warn("PostHog initialization failed safely:", error);
    }
  }
};

/**
 * Tracks successful account registration in PostHog.
 * Identifies the user by their stable internal user_id and captures signup_completed.
 * Non-blocking: all errors are caught safely and do not affect user experience.
 */
export const trackSignupCompleted = (userId: string): void => {
  try {
    if (!isInitialized) {
      initPostHog();
    }

    if (!userId) {
      return;
    }

    posthog.identify(userId);
    posthog.capture("signup_completed", {
      user_id: userId,
    });
  } catch (error) {
    console.warn("Failed to capture signup_completed event in PostHog:", error);
  }
};

/**
 * Tracks start of 10-day free trial in PostHog.
 */
export const trackTrialStarted = (userId: string, durationDays: number = 10): void => {
  try {
    if (!isInitialized) {
      initPostHog();
    }

    if (!userId) {
      return;
    }

    posthog.capture("trial_started", {
      user_id: userId,
      duration_days: durationDays,
    });
  } catch (error) {
    console.warn("Failed to capture trial_started event in PostHog:", error);
  }
};

/**
 * Tracks trial expiration in PostHog.
 */
export const trackTrialExpired = (userId: string): void => {
  try {
    if (!isInitialized) {
      initPostHog();
    }

    if (!userId) {
      return;
    }

    posthog.capture("trial_expired", {
      user_id: userId,
    });
  } catch (error) {
    console.warn("Failed to capture trial_expired event in PostHog:", error);
  }
};

export default posthog;
