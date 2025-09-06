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

  // Role color mapping
  const getRoleColors = (role: string) => {
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes("main") || roleLower.includes("protagonist")) {
      return {
        bg: "bg-blue-100 dark:bg-blue-900/40",
        text: "text-blue-800 dark:text-blue-200",
        border: "border-blue-200 dark:border-blue-700"
      };
    } else if (roleLower.includes("support")) {
      return {
        bg: "bg-green-100 dark:bg-green-900/40",
        text: "text-green-800 dark:text-green-200",
        border: "border-green-200 dark:border-green-700"
      };
    } else if (roleLower.includes("antagonist") || roleLower.includes("villain")) {
      return {
        bg: "bg-red-100 dark:bg-red-900/40",
        text: "text-red-800 dark:text-red-200",
        border: "border-red-200 dark:border-red-700"
      };
    }
    
    return {
      bg: "bg-gray-100 dark:bg-gray-800/40",
      text: "text-gray-700 dark:text-gray-300",
      border: "border-gray-200 dark:border-gray-700"
    };
  };

  const roleColors = item.role ? getRoleColors(item.role) : null;

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600"
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
          <span className="capitalize font-medium text-gray-700 dark:text-gray-300">
            {type}
          </span>
        </div>

        {favs && (
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500 shrink-0">
            <span className="text-red-500">❤️</span>
            <span className="font-medium">{favs}</span>
          </div>
        )}
      </div>

      {/* Hover indicator */}
      <div className="mt-3 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
