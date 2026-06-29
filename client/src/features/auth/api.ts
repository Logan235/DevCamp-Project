import { apiClient } from "../../lib/apiClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
}

export async function loginApi(payload: LoginPayload) {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
}

export async function registerApi(payload: RegisterPayload) {
  const response = await apiClient.post("/auth/register", payload);
  return response.data;
}

export function loginWithGoogle() {
  window.location.href = `${API_URL}/auth/google/login`;
}

export function loginWithGithub() {
  window.location.href = `${API_URL}/auth/github/login`;
}
