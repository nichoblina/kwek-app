"use client";

import type { Category } from "@/lib/types";
import { getCategoryLabel } from "@/lib/utils";

interface CategoryFilterProps {
  categories: Category[];
  active: Category | null;
  onChange: (cat: Category | null) => void;
}

export function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  if (categories.length <= 1) return null;

  return (
    <div className="flex gap-2 flex-wrap mb-5">
      <button
        onClick={() => onChange(null)}
        className={`font-mono text-[0.65rem] font-semibold px-3 py-1 rounded-full border-[1.5px] uppercase tracking-wide transition-all duration-150 cursor-pointer ${
          active === null
            ? "bg-text-primary text-bg border-text-primary"
            : "bg-transparent text-muted border-border hover:bg-text-primary hover:text-bg hover:border-text-primary"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(active === cat ? null : cat)}
          className={`font-mono text-[0.65rem] font-semibold px-3 py-1 rounded-full border-[1.5px] uppercase tracking-wide transition-all duration-150 cursor-pointer ${
            active === cat
              ? "bg-text-primary text-bg border-text-primary"
              : "bg-transparent text-muted border-border hover:bg-text-primary hover:text-bg hover:border-text-primary"
          }`}
        >
          {getCategoryLabel(cat)}
        </button>
      ))}
    </div>
  );
}
