import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSharedBrain } from "../api/brain.api";
import {
  contentStyles,
  type ContentType,
} from "../config/contentStyles";
import backIcon from "../assets/back.svg";

type SharedContent = {
  id: string;
  type: ContentType;
  link: string | null;
  title: string;
  body: Record<string, any> | null;
};

type SharedBrainData = {
  username: string;
  content: SharedContent[];
};

function shouldSpanTwoRows(item: SharedContent) {
  if (item.type !== "note") {
    return false;
  }

  if (!item.body?.content) {
    return false;
  }

  return item.body.content.length > 5;
}

function renderNoteNode(
  node: any,
  key: string
): ReactNode {
  if (!node) {
    return null;
  }

  if (node.type === "text") {
    let content: React.ReactNode = node.text || "";

    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") {
          content = <strong>{content}</strong>;
        }

        if (mark.type === "italic") {
          content = <em>{content}</em>;
        }

        if (mark.type === "underline") {
          content = <u>{content}</u>;
        }

        if (mark.type === "link") {
          content = (
            <a
              href={mark.attrs?.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {content}
            </a>
          );
        }
      }
    }

    return <span key={key}>{content}</span>;
  }

  const children = node.content?.map(
    (child: any, index: number) =>
      renderNoteNode(child, `${key}-${index}`)
  );

  switch (node.type) {
    case "paragraph":
      return (
        <p
          key={key}
          className="mb-3 leading-7 [&_p]:text-justify"
        >
          {children}
        </p>
      );

    case "heading":
      return (
        <h2
          key={key}
          className="mb-3 mt-6 text-xl font-semibold"
        >
          {children}
        </h2>
      );

    case "bulletList":
      return (
        <ul
          key={key}
          className="mb-4 list-disc space-y-1 pl-6"
        >
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol
          key={key}
          className="mb-4 list-decimal space-y-1 pl-6"
        >
          {children}
        </ol>
      );

    case "listItem":
      return <li key={key}>{children}</li>;

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="my-4 border-l-2 border-black/20 pl-4 italic opacity-70"
        >
          {children}
        </blockquote>
      );

    case "hardBreak":
      return <br key={key} />;

    default:
      return (
        <span key={key}>
          {children}
        </span>
      );
  }
}

function SharedBrain() {
  const { shareLink } = useParams();
  const navigate = useNavigate();

  const [brain, setBrain] =
    useState<SharedBrainData | null>(null);

  const [selectedContent, setSelectedContent] =
    useState<SharedContent | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBrain() {
      if (!shareLink) {
        setError("Invalid sharing link.");
        setLoading(false);
        return;
      }

      try {
        const data = await getSharedBrain(shareLink);
        setBrain(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "This shared brain could not be found."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBrain();
  }, [shareLink]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-text">
        <p className="text-sm text-muted">
          Loading shared brain...
        </p>
      </main>
    );
  }

  if (error || !brain) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-text">
        <div className="max-w-md text-center">
          <p className="font-logo text-3xl text-primary">
            synapse
          </p>

          <p className="mt-8 text-xl font-medium">
            Shared brain unavailable
          </p>

          <p className="mt-2 text-sm leading-6 text-muted">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent hover:shadow-md"
          >
            Back to my brain
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-background text-text">
        <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">

          {/* Top bar */}
          <header className="mb-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-2.5 text-sm font-medium text-muted transition hover:text-text hover:shadow-md"
            >
              <img
                src={backIcon}
                alt=""
                className="h-4 w-4"
              />

              Back to my brain
            </button>

            <span className="font-logo text-2xl tracking-wide text-primary">
              synapse
            </span>
          </header>

          {/* Header */}
          <section className="mb-10">
            <p className="text-xs font-medium tracking-[0.16em] text-muted">
              Shared brain
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {brain.username}'s synapse
            </h1>

            <p className="mt-2 text-sm text-muted">
              {brain.content.length}{" "}
              {brain.content.length === 1
                ? "saved item"
                : "saved items"}
            </p>
          </section>

          {/* Empty */}
          {brain.content.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-surface-soft px-6 text-center">
              <div>
                <p className="text-base font-medium">
                  This brain is empty
                </p>

                <p className="mt-2 text-sm text-muted">
                  This brain doesn't contain any saved content.
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          {brain.content.length > 0 && (
            <div className="grid auto-rows-[210px] grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

              {brain.content.map((item) => {
                const style = contentStyles[item.type];

                const spanTwoRows =
                  shouldSpanTwoRows(item);

                return (
                  <article
                    key={item.id}
                    onClick={() =>
                      setSelectedContent(item)
                    }
                    className={`group flex min-h-[210px] cursor-pointer flex-col rounded-xl p-5 transition-shadow duration-200 hover:shadow-lg ${style.background} ${style.text} ${
                      spanTwoRows
                        ? "row-span-2"
                        : ""
                    }`}
                  >

                    {/* Type */}
                    <div className="flex items-center gap-2">
                      <img
                        src={style.icon}
                        alt=""
                        className="h-5 w-5 object-contain opacity-70"
                      />

                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-60">
                        {style.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mt-6">
                      <h2 className="text-base font-medium leading-7 tracking-[-0.01em]">
                        {item.title}
                      </h2>

                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          className="mt-3 block truncate text-sm opacity-60 underline decoration-current/20 underline-offset-4 transition hover:opacity-100"
                        >
                          {item.link}
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}

            </div>
          )}

          {/* Footer */}
          <footer className="mt-12">
            <p className="text-xs text-muted/60">
              Shared with synapse
            </p>
          </footer>

        </div>
      </main>

      {/* Viewer */}
      {selectedContent && (() => {
        const style =
          contentStyles[selectedContent.type];

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5 py-8 backdrop-blur-[2px]"
            onClick={() => setSelectedContent(null)}
          >
            <div
              className={`flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl shadow-2xl ${style.background} ${style.text}`}
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* Viewer content */}
              <div className="content-scroll min-h-0 overflow-y-auto p-7 sm:p-9">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">
                    <img
                      src={style.icon}
                      alt=""
                      className="h-5 w-5 object-contain opacity-70"
                    />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-60">
                      {style.label}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedContent(null)
                    }
                    className="rounded-lg px-2 py-1 text-xl leading-none opacity-50 transition hover:bg-black/5 hover:opacity-100"
                  >
                    ×
                  </button>

                </div>

                <h2 className="mt-6 text-2xl font-medium leading-9 tracking-[-0.015em]">
                  {selectedContent.title}
                </h2>

                {/* Note body */}
                {selectedContent.type === "note" &&
                  selectedContent.body && (
                    <div className="tiptap mt-7 text-[15px] leading-7">
                      {selectedContent.body.content?.map(
                        (node: any, index: number) =>
                          renderNoteNode(
                            node,
                            `note-${index}`
                          )
                      )}
                    </div>
                  )}

                {/* URL */}
                {selectedContent.link && (
                  <a
                    href={selectedContent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 block break-all text-sm opacity-60 underline decoration-current/20 underline-offset-4 transition hover:opacity-100"
                  >
                    {selectedContent.link}
                  </a>
                )}


              </div>

              {/* Footer */}
              <div className="flex items-center justify-end bg-black/5 px-7 py-4 sm:px-9">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedContent(null)
                  }
                  className="rounded-lg bg-black/5 px-4 py-2 text-sm font-medium opacity-70 transition hover:bg-black/10 hover:opacity-100"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </>
  );
}

export default SharedBrain;