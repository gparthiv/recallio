interface SynaLauncherProps {
  onClick: () => void;
}
import synaIcon from "../../assets/syna.png";
export default function SynaLauncher({
  onClick,
}: SynaLauncherProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[90] group">
      {/* Tooltip */}
      <div
        className="
          pointer-events-none
          absolute bottom-full right-0 mb-3
          whitespace-nowrap
          rounded-lg
          bg-black
          px-3 py-2
          text-xs
          text-white
          opacity-0
          shadow-md
          transition-opacity
          duration-200
          group-hover:opacity-100
        "
      >
        Chat with Syna
      </div>

      {/* Launcher */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Chat with Syna"
        className="
    flex
    h-14
    w-14
    items-center
    justify-center
    bg-transparent
    p-0
    shadow-none
    transition-transform
    duration-200
    hover:scale-105
    active:scale-95
  "
      >
        <img
          src={synaIcon}
          alt="Syna"
          className="h-14 w-14 object-contain"
        />
      </button>
    </div>
  );
}