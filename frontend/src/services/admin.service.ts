import api from "@/lib/axios";

export interface AdminStatsData {
  total_registered_users: number;
  total_active_ai_users: number;
  total_ai_generations: number;
  free_users: number;
  premium_users: number;
  recent_users: Array<{
    user_id: string;
    full_name: string;
    email: string;
    is_admin: boolean;
    role: string;
    subscription_plan: string;
    subscription_status: string;
    free_usage_count: number;
    created_at: string | null;
  }>;
  recent_payments: Array<{
    payment_id: string;
    user_id: string;
    user_email?: string;
    amount: number;
    currency: string;
    upi_reference: string;
    status: string;
    submitted_at: string | null;
  }>;
}

export async function getAdminStats() {
  const response = await api.get<{ success: boolean; message: string; data: AdminStatsData }>(
    "/admin/stats"
  );
  return response.data;
}

export async function makeUserAdmin(email: string) {
  const response = await api.post<{ success: boolean; message: string; data: any }>(
    "/admin/make-admin",
    { email }
  );
  return response.data;
}
