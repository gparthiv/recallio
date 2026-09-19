import { useState, type FormEvent } from "react";
import { addContent } from "../api/content.api";
import NoteEditor from "./NoteEditor";
import {
  contentStyles,
  type ContentType,
} from "../config/contentStyles";

interface AddContentModalProps {
  onClose: () => void;
  onAdded: () => void;
}

const contentTypes: ContentType[] = [
  "note",
  "youtube",
  "tweet",
  "instagram",
  "facebook",
  "github",
  "reddit",
  "amazon",
  "flipkart",
  "googleDrive",
  "linkedin",
  "medium",
  "wikipedia",
  "openai",
  "claude",
  "gemini",
  "link",
];

export default function AddContentModal({
  onClose,
  onAdded,
}: AddContentModalProps) {
  const [type, setType] = useState<ContentType>("link");

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const [body, setBody] = useState<Record<string, unknown> | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please add a title.");
      return;
    }

    if (type !== "note" && !link.trim()) {
      setError("Please add a URL.");
      return;
    }

    if (type === "note" && !body) {
      setError("Please write something in your note.");
      return;
    }

    try {
      setLoading(true);

      await addContent({
        type,
        title: title.trim(),

        link:
          type === "note"
            ? undefined
            : link.trim(),

        body:
          type === "note"
            ? body ?? undefined
            : undefined,
      });

      onAdded();
      onClose();
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to save this content."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedStyle = contentStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-5 sm:px-7">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-text">
              Save something useful
            </h2>

            <p className="mt-1 text-sm text-muted">
              Choose what you want to keep in Synapse.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-muted transition hover:bg-surface-soft hover:text-text"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-7"
        >

          {/* Content type */}
          <div>
            <label className="text-sm font-medium text-text">
              What are you saving?
            </label>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {contentTypes.map((contentType) => {
                const style = contentStyles[contentType];
                const active = type === contentType;

                return (
                  <button
                    key={contentType}
                    type="button"
                    onClick={() => setType(contentType)}
                    className={`rounded-xl px-3 py-3 text-left transition-shadow ${active
                        ? `${style.background} ${style.text} shadow-md`
                        : "bg-surface-soft text-text hover:shadow-md"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={style.icon}
                        alt=""
                        className="h-4 w-4"
                      />

                      <p className="text-sm font-medium">
                        {style.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="mt-6">
            <label
              htmlFor="content-title"
              className="text-sm font-medium text-text"
            >
              Title
            </label>

            <input
              id="content-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Give this something memorable"
              className="mt-2 w-full rounded-xl bg-surface px-4 py-3 text-sm text-text outline-none transition-shadow placeholder:text-muted focus:shadow-md"
            />
          </div>

          {/* URL */}
          {type !== "note" && (
            <div className="mt-5">
              <label
                htmlFor="content-link"
                className="text-sm font-medium text-text"
              >
                URL
              </label>

              <input
                id="content-link"
                type="url"
                value={link}
                onChange={(event) =>
                  setLink(event.target.value)
                }
                placeholder="https://..."
                className="mt-2 w-full rounded-xl bg-surface px-4 py-3 text-sm text-text outline-none transition-shadow placeholder:text-muted focus:shadow-md"
              />
            </div>
          )}

          {/* Note */}
          {type === "note" && (
            <div className="mt-5">
              <label className="text-sm font-medium text-text">
                Note
              </label>

              <div className="mt-2 overflow-hidden rounded-xl bg-surface">
                <NoteEditor onChange={setBody} />
              </div>
            </div>
          )}

          {/* Selected type */}
          <div
            className={`mt-5 flex items-center gap-2 rounded-xl px-3 py-2.5 ${selectedStyle.background} ${selectedStyle.text}`}
          >
            <img
              src={selectedStyle.icon}
              alt=""
              className="h-4 w-4"
            />

            <span className="text-xs font-medium">
              Saving as {selectedStyle.label}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 z-20 -mx-5 mt-7 flex flex-col-reverse gap-2 bg-background px-5 py-4 sm:-mx-7 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-3 text-sm font-medium text-muted transition hover:bg-surface-soft hover:text-text"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-shadow hover:bg-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}