import api from "@/lib/axios";

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const form = new URLSearchParams();

  form.append("username", data.email);
  form.append("password", data.password);

  const response = await api.post("/auth/login", form, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (data: {
  email: string;
  reset_code: string;
  new_password: string;
}) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};