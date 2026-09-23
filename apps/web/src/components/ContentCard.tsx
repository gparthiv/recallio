import { useEffect, useRef, useState, type ReactNode } from "react";
import EditContentModal from "./EditContentModal";
import ShareNoteModal from "./ShareNoteModal";
import ConfirmModal from "./ConfirmModal";
import { X } from 'lucide-react';
import {
  contentStyles,
  type ContentType,
} from "../config/contentStyles";

interface Content {
  _id: string;
  link: string | null;
  type: ContentType;
  title: string;
  body?: Record<string, any>;
  createdAt?: string;
  shareEnabled?: boolean;
}

interface ContentCardProps {
  content: Content;
  onDelete: (contentId: string) => void;
  openContentId?: string | null;
  onUpdated: (updatedContent: Content) => void;
}

/* -------------------- Helpers -------------------- */

function getNotePreview(
  body?: Record<string, any>
) {
  if (!body?.content) {
    return "";
  }

  function extractText(node: any): string {
    if (node.type === "text") {
      return node.text || "";
    }

    if (!node.content) {
      return "";
    }

    return node.content
      .map((child: any) => extractText(child))
      .join(" ");
  }

  return body.content
    .map((node: any) => extractText(node))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldSpanTwoRows(
  content: Content
) {
  if (content.type !== "note") {
    return false;
  }

  const preview = getNotePreview(content.body);

  return preview.length > 350;
}

function formatDate(date?: string) {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

/* -------------------- Note renderer -------------------- */

function renderNoteNode(
  node: any
): ReactNode {
  if (node.type === "text") {
    let content: ReactNode = node.text;

    if (node.marks) {
      node.marks.forEach((mark: any) => {
        if (mark.type === "bold") {
          content = <strong>{content}</strong>;
        }

        if (mark.type === "italic") {
          content = <em>{content}</em>;
        }

        if (mark.type === "underline") {
          content = <u>{content}</u>;
        }
      });
    }

    return content;
  }

  const children = node.content?.map(
    (child: any, index: number) => (
      <span key={index}>
        {renderNoteNode(child)}
      </span>
    )
  );

  switch (node.type) {
    case "paragraph":
      return (
        <p className="mb-4">
          {children}
        </p>
      );

    case "heading":
      if (node.attrs?.level === 1) {
        return (
          <h1 className="mb-4 mt-8 text-2xl font-semibold">
            {children}
          </h1>
        );
      }

      if (node.attrs?.level === 2) {
        return (
          <h2 className="mb-3 mt-7 text-xl font-semibold">
            {children}
          </h2>
        );
      }

      return (
        <h3 className="mb-3 mt-6 text-lg font-semibold">
          {children}
        </h3>
      );

    case "bulletList":
      return (
        <ul className="mb-4 list-disc pl-6">
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol className="mb-4 list-decimal pl-6">
          {children}
        </ol>
      );

    case "listItem":
      return <li>{children}</li>;

    case "blockquote":
      return (
        <blockquote className="my-5 rounded-r-xl bg-black/5 px-5 py-3 italic opacity-70">
          {children}
        </blockquote>
      );

    case "hardBreak":
      return <br />;
    case "codeBlock":
      return (
        <pre className="my-5 overflow-x-auto rounded-xl bg-black/10 p-4 text-sm leading-6">
          <code>
            {node.content
              ?.map((child: any) => child.text || "")
              .join("")}
          </code>
        </pre>
      );

    default:
      return <>{children}</>;
  }
}
/* -------------------- Viewer -------------------- */

function ContentViewer({
  content,
  onClose,
  onEdit,
  onDelete,
  onShare,
}: {
  content: Content;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}) {
  const style = contentStyles[content.type];

  const viewerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewerRef.current?.focus();
  }, []);

  function handleSelectAll(
    event: React.KeyboardEvent<HTMLDivElement>
  ) {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "a"
    ) {
      event.preventDefault();

      if (!contentRef.current) {
        return;
      }

      const selection = window.getSelection();
      const range = document.createRange();

      range.selectNodeContents(contentRef.current);

      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        ref={viewerRef}
        tabIndex={0}
        onKeyDown={handleSelectAll}
        className={`flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl shadow-2xl outline-none ${style.background} ${style.text}`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}

        <div className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <img
              src={style.icon}
              alt=""
              className="h-5 w-5 object-contain opacity-70"
            />

            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${style.muted}`}
            >
              {style.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-lg opacity-60 transition hover:bg-black/10 hover:opacity-100"
          >
            <X size={24} color="currentColor" strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable content */}

        <div className="content-scroll min-h-0 overflow-y-auto px-6 pb-8 sm:px-8">
          <h1 className="break-words text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {content.title}
          </h1>

          {content.link && (
            <a
              href={content.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-4 block break-all text-sm underline decoration-current/20 underline-offset-4 ${style.muted} transition hover:opacity-100`}
            >
              {content.link}
            </a>
          )}

          {/* ONLY THIS PART GETS SELECTED BY CTRL+A */}

          {content.type === "note" &&
            content.body?.content && (
              <div
                ref={contentRef}
                className="mt-8 text-[15px] leading-7 opacity-80 [&_p]:text-justify"
              >
                {content.body.content.map(
                  (node: any, index: number) => (
                    <div key={index}>
                      {renderNoteNode(node)}
                    </div>
                  )
                )}
              </div>
            )}
        </div>

        {/* Footer */}

        <div className="flex shrink-0 items-center justify-between bg-black/[0.025] px-6 py-4 sm:px-8">
          <span className="text-xs opacity-40">
            {formatDate(content.createdAt)}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg px-3 py-2 text-xs font-medium opacity-60 transition hover:bg-black/5 hover:opacity-100"
            >
              Edit
            </button>

            {content.type === "note" && (
              <button
                type="button"
                onClick={onShare}
                className="rounded-lg px-3 py-2 text-xs font-medium opacity-60 transition hover:bg-black/5 hover:opacity-100"
              >
                Share
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg px-3 py-2 text-xs font-medium opacity-60 transition hover:bg-black/5 hover:opacity-100"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Content Card -------------------- */

function ContentCard({
  content,
  onDelete,
  openContentId,
  onUpdated,
}: ContentCardProps) {
  {
    const [showViewer, setShowViewer] =
      useState(false);

    const [showEdit, setShowEdit] =
      useState(false);

    const [showShareNote, setShowShareNote] =
      useState(false);

    const [showDeleteModal, setShowDeleteModal] =
      useState(false);

    const [deleting, setDeleting] =
      useState(false);

    const style = contentStyles[content.type];

    const spanTwoRows =
      shouldSpanTwoRows(content);

    function handleDelete() {
      setShowDeleteModal(true);
    }

    function handleConfirmDelete() {
      setDeleting(true);

      try {
        onDelete(content._id);

        setShowDeleteModal(false);
        setShowViewer(false);
      } finally {
        setDeleting(false);
      }
    }

    useEffect(() => {
      if (openContentId === content._id) {
        setShowViewer(true);
      }
    }, [openContentId, content._id]);

    return (
      <>
        {/* Card */}

        <article
          onClick={() => setShowViewer(true)}
          className={`group flex min-h-[180px] cursor-pointer flex-col rounded-xl p-4 transition-shadow duration-200 hover:shadow-lg md:min-h-[210px] md:p-5 ${style.background
            } ${style.text} ${spanTwoRows
              ? "md:row-span-2"
              : ""
            }`}
        >
          {/* Icon + date */}

          <div className="flex items-center justify-between">
            <img
              src={style.icon}
              alt=""
              className="h-5 w-5 object-contain opacity-70"
            />

            <span className="text-xs opacity-40">
              {formatDate(content.createdAt)}
            </span>
          </div>

          {/* Main content */}

          <div
            className={`mt-6 ${spanTwoRows
              ? "md:flex md:flex-1 md:flex-col"
              : ""
              }`}
          >
            <h2 className="break-words text-base font-medium leading-6 tracking-[-0.01em] md:leading-7">
              {content.title}
            </h2>

            {/* Note preview */}

            {content.type === "note" && (
              <p
                className={`mt-3 overflow-hidden text-sm leading-5 opacity-60 md:leading-6 ${spanTwoRows
                  ? "line-clamp-3 md:line-clamp-10"
                  : "line-clamp-3"
                  }`}
              >
                {getNotePreview(content.body)}
              </p>
            )}

            {/* URL */}

            {content.link && (
              <a
                href={content.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) =>
                  event.stopPropagation()
                }
                className={`mt-3 block truncate text-sm underline decoration-current/20 underline-offset-4 ${style.muted} transition hover:opacity-100`}
              >
                {content.link}
              </a>
            )}
          </div>
        </article>

        {/* Content viewer */}

        {showViewer && (
          <ContentViewer
            content={content}
            onClose={() =>
              setShowViewer(false)
            }
            onEdit={() => {
              setShowViewer(false);
              setShowEdit(true);
            }}
            onDelete={handleDelete}
            onShare={() => {
              setShowViewer(false);
              setShowShareNote(true);
            }}
          />
        )}

        {/* Delete confirmation */}

        <ConfirmModal
          open={showDeleteModal}
          title="Delete this content?"
          message="This saved content will be permanently deleted. This action cannot be undone."
          confirmText="Delete"
          loading={deleting}
          onCancel={() => {
            if (!deleting) {
              setShowDeleteModal(false);
            }
          }}
          onConfirm={handleConfirmDelete}
        />

        {/* Edit */}

        {showEdit && (
          <EditContentModal
            content={content}
            onClose={() =>
              setShowEdit(false)
            }
            onUpdated={(updatedContent) => {
              setShowEdit(false);
              onUpdated(updatedContent);
            }}
          />
        )}

        {/* Share note */}

        {showShareNote && (
          <ShareNoteModal
            contentId={content._id}
            onClose={() =>
              setShowShareNote(false)
            }
          />
        )}
      </>
    );
  }
}
export default ContentCard;