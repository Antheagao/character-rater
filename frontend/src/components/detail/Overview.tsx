import { parseAbout } from "@/lib/parseAbout";

export default function Overview({ text }: { text?: string }) {
  const { facts, paragraphs } = parseAbout(text);

  return (
    <section className="max-w-none">
      <div className="flex items-center mb-6">
        <div className="h-0.5 w-8 bg-blue-500 mr-3"></div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Overview
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {facts.length > 0 && (
          <div className="lg:w-1/3">
            <div className="sticky top-6 p-5 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                Facts
              </h3>
              <dl className="space-y-3">
                {facts.map(({ k, v }) => (
                  <div key={k} className="flex flex-col">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {k}
                    </dt>
                    <dd className="text-sm text-gray-900 dark:text-white font-medium mt-1">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
        
        <div className={`space-y-4 ${facts.length > 0 ? 'lg:w-2/3' : 'w-full'}`}>
          {(paragraphs.length ? paragraphs : ["No description available."]).map((p, i) => (
            <p 
              key={i} 
              className="text-gray-700 leading-7 dark:text-gray-300"
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
