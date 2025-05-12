"use client";

interface FactsPanelProps {
  facts: string[];
}

export default function FactsPanel({ facts }: FactsPanelProps) {
  return (
    <div className="h-1/2 p-4 border-b border-slate-700 overflow-auto">
      <h2 className="text-lg font-semibold mb-2">Facts</h2>
      <div className="bg-slate-800 rounded-md p-3 font-mono text-sm h-[calc(100%-2rem)] overflow-auto">
        {facts.length === 0 ? (
          <div className="text-slate-500 italic">No facts defined</div>
        ) : (
          facts.map((fact, i) => (
            <div key={i} className="mb-1 text-yellow-300">
              {fact}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
