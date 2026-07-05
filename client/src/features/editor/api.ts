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
  const response = await apiClient.post("/code-execution/execute", {
    challengeId: id,
    language: payload.language,
    code: payload.code,
  });

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
