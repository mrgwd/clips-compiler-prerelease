import type { Node } from "./parser";
// disable type checking for this file
// @ts-nocheck
export type Value = number | string | boolean | Value[] | null;

export interface Environment {
  variables: Map<string, Value>;
  facts: Map<string, string>;
  rules: Map<
    string,
    {
      description: string;
      conditions?: Node[];
      actions?: Node[];
    }
  >;
  factCounter: number;
}

export function createEnvironment(): Environment {
  return {
    variables: new Map([
      ["TRUE", true],
      ["FALSE", false],
      ["nil", null],
    ]),
    facts: new Map(),
    rules: new Map(),
    factCounter: 0,
  };
}

export function interpret(node: Node, env: Environment): Value {
  switch (node.type) {
    case "Program":
      let lastResult: Value = null;
      for (const child of node.children || []) {
        lastResult = interpret(child, env);
      }
      return lastResult;

    case "Expression":
      if (!node.children || node.children.length === 0) {
        throw new Error("Empty expression");
      }

      const operator = node.children[0];
      const args = node.children.slice(1);

      if (operator.type === "Identifier") {
        return evaluateFunction(operator.value, args, env);
      } else if (operator.type === "Symbol") {
        return evaluateOperator(operator.value, args, env);
      } else {
        throw new Error(`Invalid operator type: ${operator.type}`);
      }

    case "Literal":
      return node.value;

    case "Variable":
      const varName = node.value;
      if (env.variables.has(varName)) {
        return env.variables.get(varName) as Value;
      }
      throw new Error(`Variable not defined: ${varName}`);

    case "Identifier":
      return node.value;

    case "Symbol":
      return node.value;

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

function evaluateOperator(
  operator: string,
  args: Node[],
  env: Environment
): Value {
  // Evaluate all arguments first
  const evaluatedArgs = args.map((arg) => interpret(arg, env));

  switch (operator) {
    case "+":
      return evaluatedArgs.reduce((sum, val) => {
        if (typeof sum !== "number" || typeof val !== "number") {
          throw new Error("Addition requires numeric operands");
        }
        return sum + val;
      }, 0);

    case "-":
      if (evaluatedArgs.length === 0) return 0;
      if (evaluatedArgs.length === 1) {
        if (typeof evaluatedArgs[0] !== "number") {
          throw new Error("Negation requires a numeric operand");
        }
        return -evaluatedArgs[0];
      }

      if (typeof evaluatedArgs[0] !== "number") {
        throw new Error("Subtraction requires numeric operands");
      }

      return evaluatedArgs.slice(1).reduce((diff, val) => {
        if (typeof val !== "number" || typeof diff !== "number") {
          throw new Error("Subtraction requires numeric operands");
        }
        return diff - val;
      }, evaluatedArgs[0]);

    case "*":
      return evaluatedArgs.reduce((product, val) => {
        if (typeof product !== "number" || typeof val !== "number") {
          throw new Error("Multiplication requires numeric operands");
        }
        return product * val;
      }, 1);

    case "/":
      if (evaluatedArgs.length === 0)
        throw new Error("Division requires operands");
      if (typeof evaluatedArgs[0] !== "number") {
        throw new Error("Division requires numeric operands");
      }

      return evaluatedArgs.slice(1).reduce((quotient, val) => {
        if (typeof val !== "number" || typeof quotient !== "number") {
          throw new Error("Division requires numeric operands");
        }
        if (val === 0) throw new Error("Division by zero");
        return quotient / val;
      }, evaluatedArgs[0]);

    case ">":
      if (evaluatedArgs.length !== 2) {
        throw new Error("Comparison requires exactly two operands");
      }

      if (
        typeof evaluatedArgs[0] === "number" &&
        typeof evaluatedArgs[1] === "number"
      ) {
        return evaluatedArgs[0] > evaluatedArgs[1];
      } else {
        return String(evaluatedArgs[0]) > String(evaluatedArgs[1]);
      }

    case "<":
      if (evaluatedArgs.length !== 2) {
        throw new Error("Comparison requires exactly two operands");
      }

      if (
        typeof evaluatedArgs[0] === "number" &&
        typeof evaluatedArgs[1] === "number"
      ) {
        return evaluatedArgs[0] < evaluatedArgs[1];
      } else {
        return String(evaluatedArgs[0]) < String(evaluatedArgs[1]);
      }

    case "=":
      if (evaluatedArgs.length !== 2) {
        throw new Error("Comparison requires exactly two operands");
      }

      if (
        typeof evaluatedArgs[0] === "number" &&
        typeof evaluatedArgs[1] === "number"
      ) {
        return evaluatedArgs[0] === evaluatedArgs[1];
      } else {
        return String(evaluatedArgs[0]) === String(evaluatedArgs[1]);
      }

    case ">=":
      if (evaluatedArgs.length !== 2) {
        throw new Error("Comparison requires exactly two operands");
      }

      if (
        typeof evaluatedArgs[0] === "number" &&
        typeof evaluatedArgs[1] === "number"
      ) {
        return evaluatedArgs[0] >= evaluatedArgs[1];
      } else {
        return String(evaluatedArgs[0]) >= String(evaluatedArgs[1]);
      }

    case "<=":
      if (evaluatedArgs.length !== 2) {
        throw new Error("Comparison requires exactly two operands");
      }

      if (
        typeof evaluatedArgs[0] === "number" &&
        typeof evaluatedArgs[1] === "number"
      ) {
        return evaluatedArgs[0] <= evaluatedArgs[1];
      } else {
        return String(evaluatedArgs[0]) <= String(evaluatedArgs[1]);
      }

    case "!=":
      if (evaluatedArgs.length !== 2) {
        throw new Error("Comparison requires exactly two operands");
      }

      if (
        typeof evaluatedArgs[0] === "number" &&
        typeof evaluatedArgs[1] === "number"
      ) {
        return evaluatedArgs[0] !== evaluatedArgs[1];
      } else {
        return String(evaluatedArgs[0]) !== String(evaluatedArgs[1]);
      }

    case "eq":
      if (evaluatedArgs.length !== 2) {
        throw new Error("eq requires exactly two operands");
      }
      return evaluatedArgs[0] === evaluatedArgs[1];

    case "neq":
      if (evaluatedArgs.length !== 2) {
        throw new Error("neq requires exactly two operands");
      }
      return evaluatedArgs[0] !== evaluatedArgs[1];

    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

function evaluateFunction(
  funcName: string,
  args: Node[],
  env: Environment
): Value {
  switch (funcName) {
    case "bind":
      if (args.length !== 2) {
        throw new Error("bind requires exactly two arguments");
      }

      if (args[0].type !== "Variable") {
        throw new Error("First argument to bind must be a variable");
      }

      const varName = args[0].value;
      const value = interpret(args[1], env);

      env.variables.set(varName, value);
      return value;

    case "print":
    case "printout":
      let result = "";
      for (let i = 0; i < args.length; i++) {
        if (i === 0 && args[i].type === "Identifier" && args[i].value === "t") {
          // Skip the output destination (t)
          continue;
        }

        if (args[i].type === "Identifier" && args[i].value === "crlf") {
          result += "\n";
        } else {
          const value = interpret(args[i], env);
          result += formatValue(value);
        }
      }
      return result;

    case "assert":
      if (args.length !== 1) {
        throw new Error("assert requires exactly one argument");
      }

      let factContent: string;

      if (args[0].type === "Expression") {
        // Convert the expression to a string representation
        factContent = nodeToString(args[0]);
      } else {
        factContent = String(interpret(args[0], env));
      }

      env.factCounter++;
      env.facts.set(String(env.factCounter), factContent);

      return `f-${env.factCounter}`;

    case "facts":
      if (env.facts.size === 0) {
        return "No facts in the system";
      }

      let factsResult = "Facts:\n";
      env.facts.forEach((value, key) => {
        factsResult += `f-${key}: ${value}\n`;
      });

      return factsResult.trim();

    case "rules":
      if (env.rules.size === 0) {
        return "No rules in the system";
      }

      let rulesResult = "Rules:\n";
      env.rules.forEach((value, key) => {
        rulesResult += `${key}: ${value.description}\n`;
      });

      return rulesResult.trim();

    case "clear":
      env.facts.clear();
      env.rules.clear();
      env.factCounter = 0;

      // Reset variables but keep built-ins
      env.variables.clear();
      env.variables.set("TRUE", true);
      env.variables.set("FALSE", false);
      env.variables.set("nil", null);

      return "CLIPS system cleared";

    case "defrule":
      if (args.length < 1) {
        throw new Error("defrule requires at least a rule name");
      }

      if (args[0].type !== "Identifier") {
        throw new Error("First argument to defrule must be an identifier");
      }

      const ruleName = args[0].value;

      if (env.rules.has(ruleName)) {
        throw new Error(`Rule '${ruleName}' already exists`);
      }

      // Store the rule
      env.rules.set(ruleName, {
        description: nodeToString({
          type: "Expression",
          children: [{ type: "Identifier", value: "defrule" }, ...args],
        }),
        // In a real implementation, we would parse conditions and actions
      });

      return `Rule '${ruleName}' defined`;

    case "retract":
      if (args.length !== 1) {
        throw new Error("retract requires exactly one argument");
      }

      let factId: string;

      if (args[0].type === "Identifier") {
        factId = args[0]?.value?.replace(/^f-/, "");
      } else {
        const value = interpret(args[0], env);
        factId = String(value).replace(/^f-/, "");
      }

      if (env.facts.has(factId)) {
        env.facts.delete(factId);
        return `Fact f-${factId} retracted`;
      } else {
        throw new Error(`Fact f-${factId} not found`);
      }

    case "run":
      if (env.rules.size === 0) {
        return "No rules to execute";
      }

      let runResult = "Executing rules:\n";
      let activations = 0;

      env.rules.forEach((rule, ruleName) => {
        runResult += `Activated rule: ${ruleName}\n`;
        activations++;
      });

      runResult += `Run complete. ${activations} rule(s) activated.`;
      return runResult;

    case "loop-for-count":
      if (args.length < 2) {
        throw new Error(
          "loop-for-count requires at least loop parameters and an action"
        );
      }

      // Extract loop parameters
      if (args[0].type !== "Expression") {
        throw new Error(
          "First argument to loop-for-count must be a parameter list"
        );
      }

      const loopParams = args[0].children;
      if (!loopParams || loopParams.length !== 3) {
        throw new Error(
          "Loop parameters must include variable, start, and end values"
        );
      }

      if (loopParams[0].type !== "Variable") {
        throw new Error("First loop parameter must be a variable");
      }

      const loopVar = loopParams[0].value;
      const startValue = interpret(loopParams[1], env);
      const endValue = interpret(loopParams[2], env);

      if (typeof startValue !== "number" || typeof endValue !== "number") {
        throw new Error("Start and end values must be numbers");
      }

      // Check for 'do' keyword
      let actionIndex = 1;
      if (args[1].type === "Identifier" && args[1].value === "do") {
        actionIndex = 2;
      }

      if (actionIndex >= args.length) {
        throw new Error("Missing action in loop-for-count");
      }

      const action = args[actionIndex];
      let loopResult = "";

      // Execute the loop
      for (let i = startValue; i <= endValue; i++) {
        env.variables.set(loopVar, i);
        const iterationResult = interpret(action, env);
        if (iterationResult !== null && iterationResult !== undefined) {
          loopResult += String(iterationResult);
        }
      }

      return loopResult;

    case "if":
      if (args.length < 3) {
        throw new Error(
          "if requires condition, then clause, and optionally an else clause"
        );
      }

      // Evaluate the condition
      const condition = interpret(args[0], env);

      // Find 'then' and 'else' keywords
      let thenIndex = -1;
      let elseIndex = -1;

      for (let i = 1; i < args.length; i++) {
        if (args[i].type === "Identifier") {
          if (args[i].value === "then" && thenIndex === -1) {
            thenIndex = i;
          } else if (args[i].value === "else") {
            elseIndex = i;
            break;
          }
        }
      }

      if (thenIndex === -1) {
        throw new Error("Missing 'then' in if statement");
      }

      // Execute the appropriate branch
      if (condition) {
        // Execute 'then' branch
        if (thenIndex + 1 < args.length) {
          const thenEnd = elseIndex === -1 ? args.length : elseIndex;
          let result = null;

          for (let i = thenIndex + 1; i < thenEnd; i++) {
            result = interpret(args[i], env);
          }

          return result;
        }
      } else if (elseIndex !== -1) {
        // Execute 'else' branch
        if (elseIndex + 1 < args.length) {
          let result = null;

          for (let i = elseIndex + 1; i < args.length; i++) {
            result = interpret(args[i], env);
          }

          return result;
        }
      }

      return null;

    case "create$":
      // Create a multifield variable (list)
      return args.map((arg) => interpret(arg, env));

    default:
      throw new Error(`Unknown function: ${funcName}`);
  }
}

function nodeToString(node: Node): string {
  switch (node.type) {
    case "Expression":
      return `(${node.children?.map(nodeToString).join(" ")})`;
    case "Literal":
      if (typeof node.value === "string") {
        return `"${node.value}"`;
      }
      return String(node.value);
    case "Variable":
      return node.value;
    case "Identifier":
      return node.value;
    case "Symbol":
      return node.value;
    default:
      return "";
  }
}

function formatValue(value: Value): string {
  if (value === null) {
    return "nil";
  } else if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  } else if (Array.isArray(value)) {
    return `(${value.map(formatValue).join(" ")})`;
  } else {
    return String(value);
  }
}
