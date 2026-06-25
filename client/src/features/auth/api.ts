import { apiClient } from "../../lib/apiClient";

export interface LoginPayload {
  email: string;
  passWord: string;
}

export interface RegisterPayload {
  email: string;
  passWord: string;
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
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
}

export function loginWithGithub() {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/github/login`;
}
