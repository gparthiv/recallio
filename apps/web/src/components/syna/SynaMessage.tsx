import type { SynaMessage as SynaMessageType } from "./types";
import SynaSource from "./SynaSource";
import ReactMarkdown from "react-markdown";

interface SynaMessageProps {
  message: SynaMessageType;
  onSourceClick: (contentId: string) => void;
}

export default function SynaMessage({
  message,
  onSourceClick,
}: SynaMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`
        flex
        w-full
        ${isUser ? "justify-end" : "justify-start"}
      `}
    >
      <div
        className={`
          max-w-[85%]
          ${isUser ? "items-end" : "items-start"}
        `}
      >
        <div
          className={`
            rounded-2xl
            px-4
            py-3
            text-sm
            leading-relaxed
            ${
              isUser
                ? "rounded-br-md bg-[#FFF9F2] text-black"
                : "rounded-bl-md bg-[#FE7139] text-white"
            }
          `}
        >
          {isUser ? (
            message.content
          ) : (
            <div
              className="
                prose
                prose-sm
                max-w-none
                text-white

                prose-p:my-1.5
                prose-p:text-white

                prose-headings:my-2
                prose-headings:text-white

                prose-strong:text-white

                prose-ul:my-1.5
                prose-ol:my-1.5
                prose-li:my-0.5

                prose-code:text-white
              "
            >
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser &&
          message.sources &&
          message.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {message.sources.map((source) => (
                <SynaSource
                  key={source.contentId}
                  source={source}
                  onClick={onSourceClick}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}