import AppearanceCard, { AppearanceItem } from "./AppearanceCard";

interface AppearanceGridProps {
  title: string;
  items: AppearanceItem[];
  type: "anime" | "manga";
  emptyMessage?: string;
  maxItems?: number;
  showMore?: boolean;
  onShowMore?: () => void;
}

export default function AppearanceGrid({
  title,
  items,
  type,
  emptyMessage = "No appearances found",
  maxItems,
  showMore = false,
  onShowMore,
}: AppearanceGridProps) {
  if (!items?.length) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const displayedItems = maxItems ? items.slice(0, maxItems) : items;
  const hasMoreItems = maxItems && items.length > maxItems;

  return (
    <section className="mt-8">
      {/* Header with title and count */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({items.length})
          </span>
        </h3>
        
        {hasMoreItems && !showMore && (
          <button
            onClick={onShowMore}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View all
          </button>
        )}
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedItems.map((item, index) => (
          <AppearanceCard
            key={`${type}-${item.malId}-${index}`}
            item={item}
            type={type}
            priority={index < 4}
          />
        ))}
      </div>

      {/* Show more button at bottom */}
      {hasMoreItems && showMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onShowMore}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Show less
          </button>
        </div>
      )}
    </section>
  );
}
