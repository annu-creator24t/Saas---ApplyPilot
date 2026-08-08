import api from "@/lib/axios";

export interface SubscriptionStatusData {
  subscription_status: "free" | "pending" | "active" | "expired";
  subscription_plan: "free" | "pro";
  free_usage_count: number;
  free_credits_limit: number;
  free_credits_remaining: number | string;
  is_pro: boolean;
  subscription_start?: string;
  subscription_end?: string;
  payment_status: "none" | "pending" | "approved" | "rejected";
  payment_submitted_at?: string;
}

export async function getSubscriptionStatus() {
  const response = await api.get<{ success: boolean; data: SubscriptionStatusData }>(
    "/subscription/status"
  );
  return response.data;
}

export async function submitPayment(upiReference?: string) {
  const response = await api.post<{ success: boolean; message: string; data: any }>(
    "/subscription/submit-payment",
    { upi_reference: upiReference }
  );
  return response.data;
}
