export async function chatWithRag(
  req: any,
  res: any
): Promise<any> {
  try {
    const userId = req.userId;
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    if (!question.trim()) {
      return res.status(400).json({
        message: "Question cannot be empty",
      });
    }

    const aiServiceUrl =
      process.env.AI_SERVICE_URL || "http://localhost:8000";

    const response = await fetch(
      `${aiServiceUrl}/rag/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          userId: userId.toString(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("RAG service error:", data);

      return res.status(502).json({
        message: "RAG service failed",
      });
    }

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("RAG chat error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
} 