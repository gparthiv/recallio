import { useEffect, useMemo, useState } from "react";
import { getContent, deleteContent } from "../api/content.api";
import ContentCard from "../components/ContentCard";
import AddContentModal from "../components/AddContentModal";
import ShareBrainModal from "../components/ShareBrainModal";
import SearchBrainModal from "../components/SearchBrainModal";
import AccountMenu from "../components/AccountMenu";
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

type FilterType = "all" | ContentType;

const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "note", label: "Notes" },
  { value: "youtube", label: "YouTube" },
  { value: "tweet", label: "X" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "github", label: "GitHub" },
  { value: "reddit", label: "Reddit" },
  { value: "amazon", label: "Amazon" },
  { value: "flipkart", label: "Flipkart" },
  { value: "googleDrive", label: "Google Drive" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "medium", label: "Medium" },
  { value: "wikipedia", label: "Wikipedia" },
  { value: "openai", label: "OpenAI" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "link", label: "Links" },
];

export default function Dashboard() {
  const [content, setContent] = useState<Content[]>([]);

  const [activeFilter, setActiveFilter] =
    useState<FilterType>("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showAddContent, setShowAddContent] =
    useState(false);

  const [showShareBrain, setShowShareBrain] =
    useState(false);

  const [showSearchBrain, setShowSearchBrain] =
    useState(false);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getContent();

      setContent(data.content || []);
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load your saved content."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const filteredContent = useMemo(() => {
    if (activeFilter === "all") {
      return content;
    }

    return content.filter(
      (item) => item.type === activeFilter
    );
  }, [content, activeFilter]);

  const handleDelete = async (contentId: string) => {
    try {
      await deleteContent(contentId);

      setContent((current) =>
        current.filter(
          (item) => item._id !== contentId
        )
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this content."
      );
    }
  };

  const visibleFilters = filters.filter((filter) => {
    if (filter.value === "all") {
      return true;
    }

    return content.some(
      (item) => item.type === filter.value
    );
  });

  return (
    <div className="min-h-screen bg-background text-text">

      {/* Delete / general error notification */}

      {error && (
        <div className="fixed right-5 top-5 z-[110] w-[calc(100%-2.5rem)] max-w-sm rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-lg leading-none text-red-500 transition hover:text-red-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}

      <header className="sticky top-0 z-40 bg-background">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div>
            <h1 className="font-logo text-3xl tracking-wider text-primary">
              synapse
            </h1>

            <p className="hidden text-xs text-muted sm:block">
              Your second brain
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() => setShowShareBrain(true)}
              className="rounded-lg bg-surface-soft px-4 py-2.5 text-sm font-medium text-text transition-shadow hover:shadow-md"
            >
              Share brain
            </button>

            <button
              type="button"
              onClick={() => setShowAddContent(true)}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-shadow hover:bg-accent hover:shadow-md"
            >
              Add content
            </button>

            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]">

        {/* Sidebar */}

        <aside className="sticky top-[88px] hidden h-[calc(100vh-88px)] overflow-y-auto px-5 py-8 lg:block">

          <nav className="space-y-1">

            {visibleFilters.map((filter) => {
              const active =
                activeFilter === filter.value;

              const count =
                filter.value === "all"
                  ? content.length
                  : content.filter(
                      (item) =>
                        item.type === filter.value
                    ).length;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    setActiveFilter(filter.value)
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-primary font-medium text-white"
                      : "text-muted hover:bg-surface-soft hover:text-text"
                  }`}
                >
                  <span className="flex items-center gap-2">

                    {filter.value !== "all" && (
                      <img
                        src={
                          contentStyles[
                            filter.value
                          ].icon
                        }
                        alt=""
                        className="h-4 w-4 object-contain"
                      />
                    )}

                    {filter.label}
                  </span>

                  <span
                    className={`text-xs ${
                      active
                        ? "text-white/70"
                        : "text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

          </nav>

          <button
            type="button"
            onClick={() => setShowSearchBrain(true)}
            className="mt-8 w-full rounded-lg bg-surface-soft px-4 py-2.5 text-sm font-medium text-text transition-shadow hover:shadow-md"
          >
            Search a brain
          </button>

        </aside>

        {/* Main */}

        <section className="min-w-0 rounded-tl-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

          {/* Mobile filters */}

          <div className="sticky top-[88px] z-30 -mx-4 mb-6 overflow-x-auto bg-background px-4 py-3 lg:hidden">

            <div className="flex min-w-max gap-2">

              {visibleFilters.map((filter) => {
                const active =
                  activeFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() =>
                      setActiveFilter(filter.value)
                    }
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-shadow ${
                      active
                        ? "bg-primary text-white"
                        : "bg-surface-soft text-muted hover:text-text"
                    }`}
                  >

                    {filter.value !== "all" && (
                      <img
                        src={
                          contentStyles[
                            filter.value
                          ].icon
                        }
                        alt=""
                        className="h-3.5 w-3.5 object-contain"
                      />
                    )}

                    {filter.label}
                  </button>
                );
              })}

            </div>
          </div>

          {/* Page heading */}

          <div className="sticky top-[70px] z-30 -mx-4 mb-8 bg-background px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">

            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you saved
            </h2>

            {!loading && !error && (
              <span className="text-xs text-muted">
                {filteredContent.length}{" "}
                {filteredContent.length === 1
                  ? "item"
                  : "items"}
              </span>
            )}

          </div>

          {/* Loading */}

          {loading && (
            <div className="rounded-xl bg-surface p-8 text-sm text-muted">
              Loading your library...
            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="rounded-xl bg-red-50 p-5">

              <p className="text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={loadContent}
                className="mt-3 text-xs font-semibold text-red-800 underline underline-offset-4"
              >
                Try again
              </button>

            </div>
          )}

          {/* Empty */}

          {!loading &&
            !error &&
            filteredContent.length === 0 && (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-surface px-6 text-center">

                <p className="text-lg font-medium">
                  {activeFilter === "all"
                    ? "Your library is empty"
                    : "Nothing here yet"}
                </p>

                <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                  {activeFilter === "all"
                    ? "Save links, notes, videos and ideas here so you can find them later."
                    : "Try another filter or add something new to your library."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddContent(true)
                  }
                  className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-shadow hover:bg-accent hover:shadow-md"
                >
                  + Add content
                </button>

              </div>
            )}

          {/* Content */}

          {!loading &&
            !error &&
            filteredContent.length > 0 && (
              <div className="grid grid-cols-2 auto-rows-[180px] gap-3 md:grid-cols-2 md:auto-rows-[210px] md:gap-4 xl:grid-cols-3">

                {filteredContent.map((item) => (
                  <ContentCard
                    key={item._id}
                    content={item}
                    onDelete={handleDelete}
                  />
                ))}

              </div>
            )}

        </section>
      </main>

      {/* Modals */}

      {showAddContent && (
        <AddContentModal
          onClose={() =>
            setShowAddContent(false)
          }
          onAdded={loadContent}
        />
      )}

      {showShareBrain && (
        <ShareBrainModal
          onClose={() =>
            setShowShareBrain(false)
          }
        />
      )}

      {showSearchBrain && (
        <SearchBrainModal
          onClose={() =>
            setShowSearchBrain(false)
          }
        />
      )}

    </div>
  );
}