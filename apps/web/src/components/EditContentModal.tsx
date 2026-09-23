import { useState, type FormEvent } from "react";
import { updateContent } from "../api/content.api";
import NoteEditor from "./NoteEditor";
import {
  contentStyles,
  type ContentType,
} from "../config/contentStyles";
import { X } from 'lucide-react';

interface Content {
  _id: string;
  link: string | null;
  type: ContentType;
  title: string;
  body?: Record<string, any>;
}

interface EditContentModalProps {
  content: Content;
  onClose: () => void;
  onUpdated: (content: Content) => void;
}

export default function EditContentModal({
  content,
  onClose,
  onUpdated,
}: EditContentModalProps) {
  const [title, setTitle] = useState(content.title);
  const [link, setLink] = useState(content.link || "");

  const [body, setBody] = useState<Record<string, unknown> | null>(
    content.body || null
  );



  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const style = contentStyles[content.type];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please add a title.");
      return;
    }

    if (content.type !== "note" && !link.trim()) {
      setError("Please add a URL.");
      return;
    }

    if (content.type === "note" && !body) {
      setError("Please write something in your note.");
      return;
    }

    try {
      setLoading(true);

      const response = await updateContent(content._id, {
        type: content.type as Parameters<
          typeof updateContent
        >[1]["type"],

        title: title.trim(),

        link:
          content.type === "note"
            ? undefined
            : link.trim(),

        body:
          content.type === "note"
            ? body ?? undefined
            : undefined,
      });

      onUpdated(response.content || response);
      onClose();
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to update this content."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl">

        {/* Header */}
        <div
          className={`flex items-start justify-between px-6 py-5 ${style.background}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/60`}
            >
              <img
                src={style.icon}
                alt=""
                className="h-5 w-5"
              />
            </div>

            <div>
              <h2
                className={`text-xl font-semibold tracking-tight ${style.text}`}
              >
                Edit {style.label}
              </h2>

              <p className={`mt-0.5 text-xs ${style.muted}`}>
                Update your saved content
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/60 ${style.text}`}
            aria-label="Close"
          >
            <X size={24} color="currentColor" strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-6"
        >
          <div className="space-y-5">

            {/* Title */}
            <div>
              <label
                htmlFor="edit-title"
                className="mb-2 block text-sm font-medium"
              >
                Title
              </label>

              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                required
                className="w-full rounded-xl bg-surface px-4 py-3 text-sm text-text outline-none transition-shadow focus:shadow-md"
              />
            </div>

            {/* URL */}
            {content.type !== "note" && (
              <div>
                <label
                  htmlFor="edit-link"
                  className="mb-2 block text-sm font-medium"
                >
                  URL
                </label>

                <input
                  id="edit-link"
                  type="url"
                  value={link}
                  onChange={(event) =>
                    setLink(event.target.value)
                  }
                  required
                  className="w-full rounded-xl bg-surface px-4 py-3 text-sm text-text outline-none transition-shadow focus:shadow-md"
                />
              </div>
            )}

            {/* Note */}
            {content.type === "note" && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Note
                </label>

                <div className="overflow-hidden rounded-xl bg-surface">
                  <NoteEditor
                    initialContent={content.body}
                    onChange={setBody}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 z-20 -mx-6 mt-7 flex justify-end gap-2 bg-background px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-surface-soft px-4 py-2.5 text-sm font-medium text-muted transition hover:text-text hover:shadow-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}