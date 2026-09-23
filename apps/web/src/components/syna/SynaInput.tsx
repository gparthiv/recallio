import {
  useState,
  type KeyboardEvent,
} from "react";
import { Send } from "lucide-react";

interface SynaInputProps {
  onSend: (question: string) => void | Promise<void>;
  disabled?: boolean;
}

export default function SynaInput({
  onSend,
  disabled = false,
}: SynaInputProps) {
  const [value, setValue] = useState("");

  function handleSend() {
    const question = value.trim();

    if (!question || disabled) {
      return;
    }

    onSend(question);
    setValue("");
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className="
        shrink-0
        bg-white
        p-3
      "
    >
      <div
        className="
          flex
          items-end
          gap-2
          rounded-2xl
          border
          border-black/10
          bg-[#FFF9F2]
          p-2
          transition
          focus-within:border-[#FE7139]
        "
      >
        <textarea
          value={value}
          onChange={(event) =>
            setValue(event.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Ask your brain..."
          className="
            max-h-28
            min-h-9
            flex-1
            resize-none
            bg-transparent
            px-2
            py-2
            text-sm
            text-black
            outline-none
            placeholder:text-black/40
            disabled:cursor-not-allowed
          "
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#FE7139]
            text-white
            transition
            hover:opacity-90
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <Send size={17} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}