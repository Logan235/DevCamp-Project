import { apiClient } from "../../../lib/apiClient";

export async function sendAiMirrorMessage(params: {
  message: string;
  challengeId?: string;
  submissionId?: string;
}) {
  const response = await apiClient.post("/ai-mirror/chat", {
    message: params.message,
    challengeId: params.challengeId,
    submissionId: params.submissionId,
    includeLatestSubmission: true,
  });

  return response.data;
}
