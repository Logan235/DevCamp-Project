import { apiClient } from "../../lib/apiClient";

export async function getAssessmentQuestionsApi(challengeId: string) {
  const response = await apiClient.get("/assessment/questions", {
    params: { challengeId },
  });

  return response.data;
}

export async function submitAssessmentApi(payload: {
  challengeId: string;
  userCodeOutput: string[];
}) {
  const response = await apiClient.post("/assessment/submissions", payload);
  return response.data;
}

export async function getAssessmentResultsApi(challengeId: string) {
  const response = await apiClient.get("/assessment/results", {
    params: { challengeId },
  });

  return response.data;
}
