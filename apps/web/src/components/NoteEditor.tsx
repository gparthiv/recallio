import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

interface NoteEditorProps {
  onChange: (content: Record<string, unknown>) => void;
  initialContent?: Record<string, unknown>;
}

export default function NoteEditor({
  onChange,
  initialContent,
}: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing your note...",
      }),
    ],

    content: initialContent || "",

    onUpdate({ editor }) {
      onChange(
        editor.getJSON() as Record<string, unknown>
      );
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl bg-surface">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap gap-1 bg-surface-soft p-2 shadow-sm">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
          className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold transition ${
            editor.isActive("bold")
              ? "bg-primary text-white"
              : "text-text hover:bg-background"
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
          className={`rounded-lg px-2.5 py-1.5 text-sm italic transition ${
            editor.isActive("italic")
              ? "bg-primary text-white"
              : "text-text hover:bg-background"
          }`}
        >
          I
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleUnderline().run()
          }
          className={`rounded-lg px-2.5 py-1.5 text-sm underline transition ${
            editor.isActive("underline")
              ? "bg-primary text-white"
              : "text-text hover:bg-background"
          }`}
        >
          U
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
          className={`rounded-lg px-2.5 py-1.5 text-sm transition ${
            editor.isActive("heading", { level: 2 })
              ? "bg-primary text-white"
              : "text-text hover:bg-background"
          }`}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          className={`rounded-lg px-2.5 py-1.5 text-sm transition ${
            editor.isActive("bulletList")
              ? "bg-primary text-white"
              : "text-text hover:bg-background"
          }`}
        >
          • List
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          className={`rounded-lg px-2.5 py-1.5 text-sm transition ${
            editor.isActive("orderedList")
              ? "bg-primary text-white"
              : "text-text hover:bg-background"
          }`}
        >
          1. List
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="min-h-[220px] px-4 py-4 text-sm leading-7 text-text outline-none"
      />
    </div>
  );
}