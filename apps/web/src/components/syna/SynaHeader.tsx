interface SynaHeaderProps {
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}
import { X } from 'lucide-react';
import { FoldHorizontal, UnfoldHorizontal } from 'lucide-react';
import synaIcon from "../../assets/syna.png";
export default function SynaHeader({
  expanded,
  onToggleExpand,
  onClose,
}: SynaHeaderProps) {
  return (
    <header
      className="
        flex
        h-16
        shrink-0
        items-center
        justify-between
        bg-white
        px-4
      "
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <div
          className="
    flex
    h-9
    w-9
    shrink-0
    items-center
    justify-center
    rounded-full
    bg-transparent
  "
        >
          <img
            src={synaIcon}
            alt="Syna"
            className="h-6 w-6 object-contain"
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-black">
            Syna
          </h2>

          <p className="text-[11px] text-black/50">
            Chat with your brain
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Expand */}
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={
            expanded
              ? "Collapse Syna"
              : "Expand Syna"
          }
          className="
            hidden
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            text-black/60
            transition
            hover:bg-[#FFF9F2]
            hover:text-black
            lg:flex
          "
        >
          <span className="text-lg">
            {expanded ? (
  <FoldHorizontal size={17} strokeWidth={2} />
) : (
  <UnfoldHorizontal size={17} strokeWidth={2} />
)}
          </span>
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Syna"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            text-black/60
            transition
            hover:bg-[#FFF9F2]
            hover:text-black
          "
        >
          <span className="text-xl leading-none">
            <X size={24} color="currentColor" strokeWidth={2} />
          </span>
        </button>
      </div>
    </header>
  );
}