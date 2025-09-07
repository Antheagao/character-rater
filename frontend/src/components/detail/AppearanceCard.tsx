import Link from "next/link";
import { formatCompact } from "@/lib/format";

export interface AppearanceItem {
  malId: number;
  name: string;
  role?: string;
  favorites?: number;
}

interface AppearanceCardProps {
  item: AppearanceItem;
  type: "anime" | "manga";
  priority?: boolean;
}

export default function AppearanceCard({ item, type, priority = false }: AppearanceCardProps) {
  const href = `/${type}/${item.malId}`;
  const favs = typeof item.favorites === "number" ? formatCompact(item.favorites) : null;

  // Enhanced role color mapping
  const getRoleColors = (role: string) => {
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes("main") || roleLower.includes("protagonist")) {
      return {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-700"
      };
    } else if (roleLower.includes("support")) {
      return {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-700"
      };
    } else if (roleLower.includes("antagonist") || roleLower.includes("villain")) {
      return {
        bg: "bg-rose-100 dark:bg-rose-900/30",
        text: "text-rose-700 dark:text-rose-300", 
        border: "border-rose-200 dark:border-rose-700"
      };
    }
    
    return {
      bg: "bg-gray-100 dark:bg-gray-800/30",
      text: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-700"
    };
  };

  const roleColors = item.role ? getRoleColors(item.role) : null;

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-gray-200 bg-white p-4 transition-all duration-250 hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-blue-400/30"
      prefetch={!priority}
    >
      {/* Header with title and role */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="flex-1 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
          {item.name}
        </h3>
        
        {item.role && roleColors && (
          <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium border ${roleColors.bg} ${roleColors.text} ${roleColors.border}`}>
            {item.role}
          </span>
        )}
      </div>

      {/* Additional metadata */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="capitalize font-medium text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50">
            {type}
          </span>
        </div>

        {favs && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 font-medium shrink-0">
            <span className="text-rose-500">❤️</span>
            <span>{favs}</span>
          </div>
        )}
      </div>

      {/* hover indicator */}
      <div className="mt-3 h-0.5 w-0 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
