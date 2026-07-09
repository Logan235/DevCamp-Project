import { apiClient } from "../../lib/apiClient";

export async function getExercisesApi() {
  const response = await apiClient.get("/exercises");
  return response.data;
}

export async function getExerciseByIdApi(id: string) {
  const response = await apiClient.get(`/exercises/${id}`);
  return response.data;
}

export async function getSubmissionDetailApi(submissionId: string) {
  const response = await apiClient.get(`/code-execution/${submissionId}`);
  return response.data;
}

export async function chatAiMirrorApi(payload: {
  message: string;
  challengeId?: string;
  submissionId?: string;
  includeLatestSubmission?: boolean;
}) {
  const response = await apiClient.post("/ai-mirror/chat", payload);
  return response.data;
}

export async function runExerciseApi(
  id: string,
  payload: {
    language: string;
    code: string;
    stdin: string;
  },
) {
  const response = await apiClient.post(`/exercises/${id}/run`, payload);
  return response.data;
}

export async function submitExerciseApi(
  id: string,
  payload: {
    language: string;
    code: string;
  },
) {
  const response = await apiClient.post(`/exercises/${id}/submit`, payload);
  return response.data;
}

export async function completeRoadmapChallengeApi(
  challengeId: string,
  submissionIds: string[],
) {
  const response = await apiClient.post(
    `/roadmaps/me/challenges/${challengeId}/complete`,
    { submissionIds },
  );

  return response.data;
}
