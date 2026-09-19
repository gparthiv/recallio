import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSharedNote } from "../api/note.api";
import backIcon from "../assets/back.svg";
type SharedNoteData = {
  id: string;
  username: string;
  type: "note";
  title: string;
  body: Record<string, any>;
};

function renderNode(node: any, key: number): ReactNode {
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

    return <span key={key}>{content}</span>;
  }

  const children = node.content?.map(
    (child: any, index: number) =>
      renderNode(child, index)
  );

  switch (node.type) {
    case "paragraph":
      return <p key={key}>{children}</p>;

    case "heading":
      if (node.attrs?.level === 1) {
        return <h1 key={key}>{children}</h1>;
      }

      if (node.attrs?.level === 2) {
        return <h2 key={key}>{children}</h2>;
      }

      return <h3 key={key}>{children}</h3>;

    case "bulletList":
      return <ul key={key}>{children}</ul>;

    case "orderedList":
      return <ol key={key}>{children}</ol>;

    case "listItem":
      return <li key={key}>{children}</li>;

    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;

    case "hardBreak":
      return <br key={key} />;

    default:
      return (
        <div key={key}>
          {children}
        </div>
      );
  }
}

function SharedNote() {
  const { shareLink } = useParams();
  const navigate = useNavigate();

  const [note, setNote] =
    useState<SharedNoteData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNote() {
      if (!shareLink) {
        setError("Invalid note link.");
        setLoading(false);
        return;
      }

      try {
        const data = await getSharedNote(shareLink);
        setNote(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
          "This note could not be found."
        );
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [shareLink]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-text">
        <p className="text-sm text-muted">
          Loading note...
        </p>
      </main>
    );
  }

  if (error || !note) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-text">
        <div className="max-w-md text-center">
          <p className="font-logo text-3xl text-primary">
            synapse
          </p>

          <h1 className="mt-8 text-xl font-medium">
            Note unavailable
          </h1>

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
    <main className="min-h-screen bg-background text-text">
      <article className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Top bar */}
        <header className="mb-12">
          <div className="mb-10 flex items-center justify-between">
            <div>
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
            </div>
            <span className="font-logo text-2xl text-primary">
              synapse
            </span>
          </div>

          <div className="rounded-2xl bg-surface-soft p-6 sm:p-8">
            <p className="text-xs font-medium tracking-[0.16em] text-muted">
              Shared note
            </p>

            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {note.title}
            </h1>

            <p className="mt-3 text-sm text-muted">
              Shared by {note.username}
            </p>
          </div>
        </header>

        {/* Note content */}
        <div
          className="
            text-[15px]
            leading-7
            text-text/75

            [&_p]:mb-5
            [&_p]:text-justify            

            [&_h1]:mb-4
            [&_h1]:mt-8
            [&_h1]:text-3xl
            [&_h1]:font-semibold
            [&_h1]:leading-tight
            [&_h1]:text-text

            [&_h2]:mb-3
            [&_h2]:mt-8
            [&_h2]:text-2xl
            [&_h2]:font-semibold
            [&_h2]:text-text

            [&_h3]:mb-3
            [&_h3]:mt-7
            [&_h3]:text-xl
            [&_h3]:font-semibold
            [&_h3]:text-text

            [&_ul]:mb-5
            [&_ul]:list-disc
            [&_ul]:pl-6

            [&_ol]:mb-5
            [&_ol]:list-decimal
            [&_ol]:pl-6

            [&_blockquote]:my-6
            [&_blockquote]:rounded-r-xl
            [&_blockquote]:bg-surface-soft
            [&_blockquote]:px-5
            [&_blockquote]:py-3
            [&_blockquote]:italic
            [&_blockquote]:text-muted
          "
        >
          {note.body?.content?.map(
            (node: any, index: number) =>
              renderNode(node, index)
          )}
        </div>

        {/* Footer */}
        <footer className="mt-14">
          <p className="text-xs text-muted/60">
            Shared with synapse
          </p>
        </footer>
      </article>
    </main>
  );
}

export default SharedNote;
