import { apiClient } from "../../lib/apiClient";

export async function getAssessmentQuestionsApi(assessmentId?: string) {
  const response = await apiClient.get("/assessment/questions", {
    params: assessmentId ? { assessmentId } : {},
  });

  return response.data;
}

export async function submitAssessmentApi(payload: {
  assessmentId?: string;
  challengeId?: string;
  userCodeOutput: string[];
}) {
  const response = await apiClient.post("/assessment/submissions", payload);
  return response.data;
}

export async function getAssessmentResultsApi(assessmentId: string) {
  const response = await apiClient.get("/assessment/results", {
    params: { assessmentId },
  });

  return response.data;
}
