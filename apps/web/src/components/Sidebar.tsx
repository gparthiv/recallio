import type { ContentFilter } from "../types/content.types";

interface SidebarProps {
  selectedFilter: ContentFilter;
  onFilterChange: (filter: ContentFilter) => void;
}

const filters: {
  label: string;
  value: ContentFilter;
  icon: string;
}[] = [
  { label: "All", value: "all", icon: "⌂" },
  { label: "Notes", value: "note", icon: "▤" },
  { label: "Tweets", value: "tweet", icon: "𝕏" },
  { label: "Videos", value: "youtube", icon: "▶" },
  { label: "Links", value: "link", icon: "↗" },
];

export default function Sidebar({
  selectedFilter,
  onFilterChange,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">R</div>
        <span>synapse</span>
      </div>

      <nav className="sidebar-nav">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`sidebar-item ${
              selectedFilter === filter.value ? "active" : ""
            }`}
            onClick={() => onFilterChange(filter.value)}
          >
            <span className="sidebar-icon">{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}