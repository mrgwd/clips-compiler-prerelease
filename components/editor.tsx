"use client";

import { useState } from "react";
import Terminal from "@/components/terminal";
import FactsPanel from "@/components/facts-panel";
import RulesPanel from "@/components/rules-panel";
import { ScriptEngine } from "@/lib/interpreter";

export default function ClipsEditor() {
  const [facts, setFacts] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  const [engine] = useState(() => new ScriptEngine());

  const handleCommand = (command: string) => {
    const result = engine.execute(command);
    setOutput((prev) => [...prev, `> ${command}`, ...result]);

    // Update facts and rules
    setFacts(engine.getFacts());
    setRules(engine.getRules());
  };
  return (
    <div className="flex flex-col bg-slate-900 text-white h-full">
      <div className="flex flex-col md:flex-row h-full">
        <div className="flex-1 p-4">
          <Terminal onCommand={handleCommand} output={output} />
        </div>
        <div className="flex flex-col md:w-80 border-l border-slate-700">
          <FactsPanel facts={facts} />
          <RulesPanel rules={rules} />
        </div>
      </div>
    </div>
  );
}
