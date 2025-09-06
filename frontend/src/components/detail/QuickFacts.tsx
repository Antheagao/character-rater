export default function QuickFacts({
  type, data,
}: { type: "characters" | "anime" | "manga"; data: any }) {
  
  // Helper function to render fact items consistently
  const renderFactItem = (label: string, value: any, formatter?: (val: any) => string) => {
    if (value == null) return null;
    
    const formattedValue = formatter ? formatter(value) : value;
    
    return (
      <li className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formattedValue}</span>
      </li>
    );
  };

  // Format score to 1 decimal place
  const formatScore = (score: number) => score.toFixed(1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60 dark:hover:bg-gray-800">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
        Quick Facts
      </h3>

      {type === "anime" && (
        <ul className="space-y-3">
          {renderFactItem("Score", data.score, formatScore)}
          {renderFactItem("Episodes", data.episodes)}
          {renderFactItem("Status", data.status)}
          {renderFactItem("Type", data.type)}
          {renderFactItem("Source", data.source)}
          {renderFactItem("Rating", data.rating)}
          {renderFactItem("Duration", data.duration)}
          {renderFactItem("Season", data.season)}
          {renderFactItem("Year", data.year)}
          {data.genres?.length > 0 && renderFactItem("Genres", data.genres.join(", "))}
          {data.studios?.length > 0 && renderFactItem("Studios", data.studios.join(", "))}
        </ul>
      )}
      
      {type === "manga" && (
        <ul className="space-y-3">
          {renderFactItem("Score", data.score, formatScore)}
          {renderFactItem("Chapters", data.chapters)}
          {renderFactItem("Volumes", data.volumes)}
          {renderFactItem("Status", data.status)}
          {renderFactItem("Type", data.type)}
          {renderFactItem("Serialization", data.serialization)}
          {renderFactItem("Year", data.year)}
          {data.genres?.length > 0 && renderFactItem("Genres", data.genres.join(", "))}
          {data.authors?.length > 0 && renderFactItem("Authors", data.authors.join(", "))}
        </ul>
      )}
      
      {type === "characters" && (
        <ul className="space-y-3">
          {renderFactItem("Favorites", data.favorites?.toLocaleString())}
          {data.nicknames?.length > 0 && renderFactItem("Nicknames", data.nicknames.join(", "))}
          {renderFactItem("Gender", data.gender)}
          {renderFactItem("Age", data.age)}
          {renderFactItem("Birthday", data.birthday)}
          {renderFactItem("Height", data.height)}
          {renderFactItem("Weight", data.weight)}
          {renderFactItem("Blood Type", data.bloodType)}
          {renderFactItem("Occupation", data.occupation)}
          {renderFactItem("Affiliation", data.affiliation)}
        </ul>
      )}
    </div>
  );
}
