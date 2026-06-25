import { apiClient } from "../../lib/apiClient";

export async function getExercisesApi() {
  const response = await apiClient.get("/exercises");
  return response.data;
}

export async function getExerciseByIdApi(id: string) {
  const response = await apiClient.get(`/exercises/${id}`);
  return response.data;
}

export async function submitExerciseApi(
  id: string,
  payload: {
    language: string;
    code: string;
  },
) {
  const response = await apiClient.post(`/exercises/${id}`, payload);
  return response.data;
}
