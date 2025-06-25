import type { ExcalidrawElement } from "@excalidraw/excalidraw/types";

export interface LLMAgentRequest {
  prompt: string;
  selectedElements?: ExcalidrawElement[];
  sceneElements: ExcalidrawElement[];
  chatHistory?: { role: string; content: string }[];
}

export interface LLMAgentResponse {
  newElements?: ExcalidrawElement[];
  modifiedElements?: { id: string; updates: Partial<ExcalidrawElement> }[];
  textResponse?: string;
  error?: string;
}

export const fetchLLMAssistantResponse = async (
  requestData: LLMAgentRequest,
): Promise<LLMAgentResponse> => {
  try {
    const response = await fetch(
      // In a real scenario, VITE_APP_AI_BACKEND would be loaded from environment
      (import.meta.env.VITE_APP_AI_BACKEND || 'http://localhost:3015') + '/v1/ai/llm-brainstorm',
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Network error or invalid JSON response" }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("LLM Assistant API error:", error);
    return { error: error.message || "Failed to fetch response from LLM assistant." };
  }
};
