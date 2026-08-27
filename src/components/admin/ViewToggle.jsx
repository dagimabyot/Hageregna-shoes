import React from "react";
import { LayoutGrid, List } from "lucide-react";

export default function ViewToggle({ view, onViewChange }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg border border-border/60 bg-card">
      <button
        onClick={() => onViewChange("grid")}
        className={`p-2 rounded-md transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        title="Grid View"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`p-2 rounded-md transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        title="List View"
      >
        <List size={16} />
      </button>
    </div>
  );
}