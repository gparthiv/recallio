import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { X } from 'lucide-react';

interface SearchBrainModalProps {
  onClose: () => void;
}

export default function SearchBrainModal({
  onClose,
}: SearchBrainModalProps) {
  const [shareLink, setShareLink] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const value = shareLink.trim();

    if (!value) return;

    navigate(`/brain/${value}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-7 flex items-start justify-between">
          <div>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-text">
              Search a brain
            </h2>

            <p className="mt-2 text-sm leading-5 text-muted">
              Enter someone's public brain ID to explore
              their saved content.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-muted transition hover:bg-surface-soft hover:text-text"
            aria-label="Close"
          >
            <X size={24} color="currentColor" strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="brain-share-link"
            className="text-sm font-medium text-text"
          >
            Brain ID
          </label>

          <input
            id="brain-share-link"
            type="text"
            value={shareLink}
            onChange={(e) => setShareLink(e.target.value)}
            placeholder="Enter a shared brain ID"
            autoFocus
            className="mt-2 w-full rounded-xl bg-surface px-4 py-3 text-sm text-text outline-none transition-shadow placeholder:text-muted focus:shadow-md"
          />

          <p className="mt-2 text-xs leading-5 text-muted">
            Use the public ID from the shared brain link.
          </p>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-soft hover:text-text"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!shareLink.trim()}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-shadow hover:bg-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              View brain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}