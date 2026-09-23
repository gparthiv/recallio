import type { SynaSource as SynaSourceType } from "./types";

interface SynaSourceProps {
  source: SynaSourceType;
  onClick: (contentId: string) => void;
}

export default function SynaSource({
  source,
  onClick,
}: SynaSourceProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(source.contentId)}
      title={source.title}
      className="
        max-w-[180px]
        truncate
        rounded-full
        border
        border-black/10
        bg-[#FFF9F2]
        px-2.5
        py-1
        text-left
        text-[11px]
        font-medium
        text-black
        transition
        hover:bg-white
        hover:shadow-sm
        active:scale-[0.98]
      "
    >
      {source.title}
    </button>
  );
}