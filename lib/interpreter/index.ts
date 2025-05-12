import { tokenize } from "./tokenizer"
import { parse } from "./parser"
import { interpret, createEnvironment, type Environment, type Value } from "./interpreter"

export class ScriptEngine {
  private env: Environment

  constructor() {
    this.env = createEnvironment()
  }

  execute(command: string): string[] {
    try {
      // Tokenize the input
      const tokens = tokenize(command)

      // Parse the tokens into an AST
      const ast = parse(tokens)

      // Interpret the AST
      const result = interpret(ast, this.env)

      // Format the result
      if (result === null || result === undefined) {
        return []
      } else if (typeof result === "string" && result.includes("\n")) {
        return result.split("\n")
      } else {
        return [String(result)]
      }
    } catch (error) {
      console.error("Error executing command:", error)
      return [`Error: ${(error as Error).message}`]
    }
  }

  getFacts(): string[] {
    const result: string[] = []
    this.env.facts.forEach((value, key) => {
      result.push(`f-${key}: ${value}`)
    })
    return result
  }

  getRules(): string[] {
    const result: string[] = []
    this.env.rules.forEach((value, key) => {
      result.push(`${key}: ${value.description}`)
    })
    return result
  }

  getVariables(): string[] {
    const result: string[] = []
    this.env.variables.forEach((value, key) => {
      if (key !== "TRUE" && key !== "FALSE" && key !== "nil") {
        result.push(`${key}: ${formatValue(value)}`)
      }
    })
    return result
  }

  clear(): void {
    this.env = createEnvironment()
  }
}

function formatValue(value: Value): string {
  if (value === null) {
    return "nil"
  } else if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE"
  } else if (Array.isArray(value)) {
    return `(${value.map(formatValue).join(" ")})`
  } else {
    return String(value)
  }
}
