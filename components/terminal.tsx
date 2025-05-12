"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Send } from "lucide-react";

interface TerminalProps {
  onCommand: (command: string) => void;
  output: string[];
}

export default function Terminal({ onCommand, output }: TerminalProps) {
  const [input, setInput] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input.trim());
      setHistory((prev) => [input.trim(), ...prev]);
      setHistoryIndex(-1);
      setInput("");
    }
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const handleExampleClick = (example: string) => {
    // Instead of executing, just set the input field
    setInput(example);
    // Focus the textarea
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Terminal</h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExampleClick("(facts)")}
          >
            Facts
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExampleClick("(rules)")}
          >
            Rules
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExampleClick("(clear)")}
          >
            Clear
          </Button>
        </div>
      </div>

      <div
        ref={outputRef}
        className="flex-1 bg-slate-950 rounded-md p-3 mb-3 font-mono text-sm "
      >
        {output.length === 0 ? (
          <div className="text-slate-500">
            Welcome to CLIPS Online Editor. Click an example to add it to the
            input field, then edit if needed and run.
            <br />
            <br />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <h3 className="text-slate-400 font-semibold mb-1">
                  Arithmetic Operations:
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleExampleClick("(+ 3 3)")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (+ 3 3)
                  </button>
                  <button
                    onClick={() => handleExampleClick("(- 10 5)")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (- 10 5)
                  </button>
                  <button
                    onClick={() => handleExampleClick("(* 2 3 4)")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (* 2 3 4)
                  </button>
                  <button
                    onClick={() => handleExampleClick("(/ 10 2)")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (/ 10 2)
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-slate-400 font-semibold mb-1">
                  Comparison Operations:
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleExampleClick("(> 5 3)")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (&gt; 5 3)
                  </button>
                  <button
                    onClick={() => handleExampleClick("(< 5 10)")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (&lt; 5 10)
                  </button>
                  <button
                    onClick={() => handleExampleClick("(= 5 5)")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (= 5 5)
                  </button>
                  <button
                    onClick={() => handleExampleClick("(eq 5 5)")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (eq 5 5)
                  </button>
                  <button
                    onClick={() => handleExampleClick('(neq "hello" "world")')}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (neq "hello" "world")
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-slate-400 font-semibold mb-1">
                  Variables:
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleExampleClick("(bind ?x 10)")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (bind ?x 10)
                  </button>
                  {/* <button
                    onClick={() => handleExampleClick("?x")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    ?x
                  </button> */}
                  <button
                    onClick={() =>
                      handleExampleClick("(bind ?list (create$ 1 2 3))")
                    }
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (bind ?list (create$ 1 2 3))
                  </button>
                  {/* <button
                    onClick={() => handleExampleClick("?list")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    ?list
                  </button> */}
                </div>
              </div>

              <div>
                <h3 className="text-slate-400 font-semibold mb-1">
                  Control Structures:
                </h3>
                <div className="space-y-1">
                  {/* <button
                    onClick={() =>
                      handleExampleClick(
                        "(loop-for-count (?c 1 5) do (printout t ?c crlf))"
                      )
                    }
                    className="block text-blue-400 hover:underline cursor-pointer text-xs"
                  >
                    (loop-for-count (?c 1 5) do (printout t ?c crlf))
                  </button> */}
                  <button
                    onClick={() => handleExampleClick("(bind ?n 7)")}
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (bind ?n 7)
                  </button>
                  <button
                    onClick={() =>
                      handleExampleClick(
                        '(if (> 7 5) then (printout t "Greater than 5") else (printout t "Less than 5"))'
                      )
                    }
                    className="block text-blue-400 hover:underline cursor-pointer text-xs"
                  >
                    (if (&gt; 7 5) then (printout t "Greater than 5") else
                    (printout t "Less than 5"))
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-slate-400 font-semibold mb-1">
                  Facts and Rules:
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() =>
                      handleExampleClick("(assert (student mohamed))")
                    }
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (assert (student mohamed))
                  </button>
                  <button
                    onClick={() =>
                      handleExampleClick(
                        "(defrule adult-rule (person (age ?a)) => (assert (adult ?a)))"
                      )
                    }
                    className="block text-blue-400 hover:underline cursor-pointer text-xs"
                  >
                    (defrule adult-rule (person (age ?a)) =&gt; (assert (adult
                    ?a)))
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleExampleClick("(facts)")}
                      className="block text-blue-400 hover:underline cursor-pointer"
                    >
                      (facts)
                    </button>
                    {","}
                    <button
                      onClick={() => handleExampleClick("(rules)")}
                      className="block text-blue-400 hover:underline cursor-pointer"
                    >
                      (rules)
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-slate-400 font-semibold mb-1">Output:</h3>
                <div className="space-y-1">
                  <button
                    onClick={() =>
                      handleExampleClick('(printout t "Hello, world!" crlf)')
                    }
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (printout t "Hello, world!" crlf)
                  </button>
                  <button
                    onClick={() =>
                      handleExampleClick('(print "Simple output")')
                    }
                    className="block text-blue-400 hover:underline cursor-pointer"
                  >
                    (print "Simple output")
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          output.map((line, i) => (
            <div
              key={i}
              className={`mb-1 ${
                line.startsWith(">") ? "text-green-300" : "text-slate-400"
              }`}
            >
              {line}
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 max-sm:sticky bottom-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter CLIPS command..."
          className="flex-1 font-mono bg-slate-800 border-slate-700 resize-none"
          rows={3}
          onKeyDown={handleKeyDown}
        />
        <Button type="submit" className="h-10 max-sm:absolute right-2 mb-2">
          <Play className="h-4 w-4 sm:mr-2" />
          <span className="max-sm:hidden">Run</span>
        </Button>
      </form>
    </div>
  );
}
