import { apiClient } from "../../lib/apiClient";

export async function getMyRoadmapsApi() {
  const response = await apiClient.get("/roadmaps/me");
  return response.data;
}

export async function updateMyRoadmapApi(payload: unknown) {
  const response = await apiClient.put("/roadmaps/me", payload);
  return response.data;
}
