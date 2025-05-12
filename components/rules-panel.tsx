"use client";

interface RulesPanelProps {
  rules: string[];
}

export default function RulesPanel({ rules }: RulesPanelProps) {
  return (
    <div className="h-1/2 p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-2">Rules</h2>
      <div className="bg-slate-800 rounded-md p-3 font-mono text-sm h-[calc(100%-2rem)] overflow-auto">
        {rules.length === 0 ? (
          <div className="text-slate-500 italic">No rules defined</div>
        ) : (
          rules.map((rule, i) => (
            <div key={i} className="mb-1 text-blue-300">
              {rule}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
