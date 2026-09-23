import type { SynaChatResponse } from "../components/syna/types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function askSyna(
  question: string,
  token: string
): Promise<SynaChatResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/rag/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
      }),
    }
  );

  if (!response.ok) {
    let message = "Failed to contact Syna";

    try {
      const error = await response.json();

      if (error?.message) {
        message = error.message;
      }
    } catch {
      // Ignore invalid error response
    }

    throw new Error(message);
  }

  return response.json();
}