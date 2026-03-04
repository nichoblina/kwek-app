import type { Category } from "@/lib/types";
import { getCategoryLabel, getCategoryColor } from "@/lib/utils";

interface BadgeProps {
  category: Category;
  size?: "sm" | "md";
}

export function Badge({ category, size = "md" }: BadgeProps) {
  const color = getCategoryColor(category);
  const label = getCategoryLabel(category);

  const sizeClasses =
    size === "sm"
      ? "text-[0.6rem] px-2 py-0.5"
      : "text-[0.65rem] px-2.5 py-0.5";

  return (
    <span
      className={`font-mono font-semibold rounded-full uppercase tracking-wide ${sizeClasses}`}
      style={{
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        color,
      }}
    >
      {label}
    </span>
  );
}

export function CategoryDot({ category }: { category: Category }) {
  const color = getCategoryColor(category);
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
      style={{ background: color }}
      title={getCategoryLabel(category)}
    />
  );
}
