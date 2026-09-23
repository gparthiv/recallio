import { useState } from "react";

import { askSyna } from "../../api/rag";

import SynaHeader from "./SynaHeader";
import SynaMessage from "./SynaMessage";
import SynaInput from "./SynaInput";

import type { SynaMessage as SynaMessageType } from "./types";

interface SynaChatProps {
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  token: string;
  onSourceClick: (contentId: string) => void;
}

export default function SynaChat({
  expanded,
  onToggleExpand,
  onClose,
  token,
  onSourceClick,
}: SynaChatProps) {
  const [messages, setMessages] =
    useState<SynaMessageType[]>([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hey! I'm Syna, your personal knowledge assistant. Ask me anything about what you've saved.",
      },
    ]);

  const [loading, setLoading] =
    useState(false);

  async function handleSend(question: string) {
    if (loading) {
      return;
    }

    const userMessage: SynaMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setLoading(true);

    try {
      const response = await askSyna(
        question,
        token
      );

      const assistantMessage: SynaMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        foundInSynapse:
          response.foundInSynapse,
        offerInternetSearch:
          response.offerInternetSearch,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "Syna chat error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Something went wrong while searching your brain. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="
        flex
        h-full
        min-h-0
        flex-col
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-sm
      "
    >
      <SynaHeader
        expanded={expanded}
        onToggleExpand={onToggleExpand}
        onClose={onClose}
      />

      {/* Messages */}
      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          bg-white
          px-4
          py-5
        "
      >
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <SynaMessage
              key={message.id}
              message={message}
              onSourceClick={onSourceClick}
            />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div
                className="
                  rounded-2xl
                  rounded-bl-md
                  bg-[#FE7139]
                  px-4
                  py-3
                  text-sm
                  text-white
                "
              >
                <span className="animate-pulse">
                  Syna is thinking...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <SynaInput
        onSend={handleSend}
        disabled={loading}
      />
    </section>
  );
}  