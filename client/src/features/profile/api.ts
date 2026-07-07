import { apiClient } from "../../lib/apiClient";

export async function getMeApi() {
  const response = await apiClient.get("/users/me");
  return response.data;
}

export async function updateMeApi(payload: { displayName?: string }) {
  const response = await apiClient.patch("/users/me", payload);
  return response.data;
}
