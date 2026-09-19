import { useState } from "react";
import { getContent } from "../api/content.api";

export default function BackendTest() {
  const [message, setMessage] = useState("Not tested yet");
  const [loading, setLoading] = useState(false);

  async function testBackend() {
    try {
      setLoading(true);
      setMessage("Connecting...");

      const data = await getContent();
      console.log("API URL:", import.meta.env.VITE_API_URL);
      console.log("Backend response:", data);

      setMessage("Backend connected successfully!");
    } catch (error: any) {
      console.error("Backend connection error:", error);

      if (error.response) {
        setMessage(
          `Backend responded with ${error.response.status}`
        );
      } else {
        setMessage("Could not connect to backend");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>synapse Backend Test</h1>

      <button onClick={testBackend} disabled={loading}>
        {loading ? "Testing..." : "Test Backend"}
      </button>

      <p>{message}</p>
    </div>
  );
}