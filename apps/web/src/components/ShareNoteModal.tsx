import { useState } from "react";
import { shareNote } from "../api/note.api";
import { X } from 'lucide-react';

type ShareNoteModalProps = {
  contentId: string;
  onClose: () => void;
};

function ShareNoteModal({
  contentId,
  onClose,
}: ShareNoteModalProps) {
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function enableSharing() {
    try {
      setLoading(true);
      setError("");

      const data = await shareNote(contentId, true);

      const fullLink =
        `${window.location.origin}/note/share/${data.link}`;

      setShareLink(fullLink);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to create sharing link."
      );
    } finally {
      setLoading(false);
    }
  }

  async function disableSharing() {
    try {
      setLoading(true);
      setError("");

      await shareNote(contentId, false);

      setShareLink("");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to disable sharing."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy the link.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-text">
              Share note
            </h2>

            <p className="mt-2 text-sm leading-5 text-muted">
              Anyone with the link will be able to read this
              note.
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

        {/* Not shared */}
        {!shareLink && (
          <div>
            <div className="rounded-xl bg-surface-soft p-4">
              <p className="text-sm font-medium text-text">
                This note is private.
              </p>

              <p className="mt-1 text-xs leading-5 text-muted">
                Create a public link to share this note.
              </p>
            </div>

            <button
              type="button"
              onClick={enableSharing}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition-shadow hover:bg-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating link..." : "Enable sharing"}
            </button>
          </div>
        )}

        {/* Shared */}
        {shareLink && (
          <div>
            <div className="rounded-xl bg-surface p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-muted">
                Public link
              </p>

              <p className="break-all text-sm leading-6 text-text/70">
                {shareLink}
              </p>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={copyLink}
                className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition-shadow hover:bg-accent hover:shadow-md"
              >
                {copied ? "Copied" : "Copy link"}
              </button>

              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-surface-soft px-4 py-3 text-center text-sm font-medium text-text transition-shadow hover:shadow-md"
              >
                Open
              </a>
            </div>

            <button
              type="button"
              onClick={disableSharing}
              disabled={loading}
              className="mt-5 text-sm text-muted underline underline-offset-4 transition hover:text-red-600 disabled:opacity-50"
            >
              {loading ? "Disabling..." : "Disable sharing"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default ShareNoteModal;