import { useState } from "react";
import { getToken } from "../utils/auth.ts";
import SynaLauncher from "../components/syna/SynaLauncher";
import SynaChat from "../components/syna/SynaChat";

export default function SynaTest() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Temporary.
  // We will connect this to the existing auth mechanism
  // when integrating Syna into Dashboard.
  const token = getToken() || "";

  function handleSourceClick(contentId: string) {
    console.log("Syna source clicked:", contentId);
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold text-black">
          Syna Test
        </h1>

        <p className="mt-2 text-sm text-black/50">
          Temporary page for testing the Syna AI component.
        </p>
      </div>

      {!isOpen && (
        <SynaLauncher
          onClick={() => setIsOpen(true)}
        />
      )}

      {isOpen && (
        <div
          className={`
      fixed
      inset-y-0
      right-0
      z-[100]
      w-full
      p-4
      transition-all
      duration-300
      ${isExpanded
              ? "lg:w-[760px]"
              : "lg:w-[420px]"
            }
    `}
        >
          <SynaChat
            expanded={isExpanded}
            onToggleExpand={() =>
              setIsExpanded((previous) => !previous)
            }
            onClose={() => {
              setIsOpen(false);
              setIsExpanded(false);
            }}
            token={token}
            onSourceClick={handleSourceClick}
          />
        </div>
      )}
    </div>
  );
}