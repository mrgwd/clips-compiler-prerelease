"use client"

/**
 * A simplified CLIPS engine implementation
 */
export class ClipsEngine {
  private facts: Map<string, string> = new Map()
  private rules: Map<string, any> = new Map()
  private factCounter = 0
  private variables: Map<string, any> = new Map()

  constructor() {
    // Initialize with some built-in functions and constants
    this.variables.set("TRUE", true)
    this.variables.set("FALSE", false)
    this.variables.set("nil", null)
  }

  executeCommand(command: string): string[] {
    command = command.trim()

    try {
      // Simple command matching
      if (command === "(facts)") {
        return this.listFacts()
      } else if (command === "(rules)") {
        return this.listRules()
      } else if (command === "(clear)") {
        return this.clear()
      } else if (command === "(run)") {
        return this.run()
      } else if (command.startsWith("(assert")) {
        return this.assertFact(command)
      } else if (command.startsWith("(defrule")) {
        return this.defineRule(command)
      } else if (command.startsWith("(retract")) {
        return this.retractFact(command)
      } else if (command.startsWith("(print")) {
        return this.print(command)
      } else if (command.startsWith("(+")) {
        return this.add(command)
      } else if (command.startsWith("(-")) {
        return this.subtract(command)
      } else if (command.startsWith("(*")) {
        return this.multiply(command)
      } else if (command.startsWith("(/")) {
        return this.divide(command)
      } else if (command.startsWith("(>")) {
        return this.evaluateComparison(command, ">")
      } else if (command.startsWith("(<")) {
        return this.evaluateComparison(command, "<")
      } else if (command.startsWith("(=")) {
        return this.evaluateComparison(command, "=")
      } else if (command.startsWith("(>=")) {
        return this.evaluateComparison(command, ">=")
      } else if (command.startsWith("(<=")) {
        return this.evaluateComparison(command, "<=")
      } else if (command.startsWith("(!=")) {
        return this.evaluateComparison(command, "!=")
      } else if (command.startsWith("(eq")) {
        return this.evaluateEquality(command, "eq")
      } else if (command.startsWith("(neq")) {
        return this.evaluateEquality(command, "neq")
      } else if (command.startsWith("(bind")) {
        return this.bindVariable(command)
      } else if (command.startsWith("(loop-for-count")) {
        return this.loopForCount(command)
      } else if (command.startsWith("(if")) {
        return this.ifThenElse(command)
      } else if (command.startsWith("(?")) {
        // Variable reference
        const varName = command.trim()
        if (this.variables.has(varName)) {
          const value = this.variables.get(varName)
          return [this.formatValue(value)]
        } else {
          return [`Variable ${varName} not defined`]
        }
      } else {
        return ["Unknown command or syntax error"]
      }
    } catch (error) {
      console.error("Error executing command:", error)
      return [`Error: ${(error as Error).message}`]
    }
  }

  // Format values for display
  private formatValue(value: any): string {
    if (value === null) {
      return "nil"
    } else if (typeof value === "boolean") {
      return value ? "TRUE" : "FALSE"
    } else if (Array.isArray(value)) {
      return `(${value.map((v) => this.formatValue(v)).join(" ")})`
    } else {
      return String(value)
    }
  }

  // Variable binding
  private bindVariable(command: string): string[] {
    try {
      // Extract variable name and value from (bind ?x 10)
      const bindRegex = /$$bind\s+(\?\w+)\s+(.*)$$/
      const match = command.match(bindRegex)

      if (!match) {
        console.log("Bind regex failed to match:", command)
        return ["Invalid bind syntax"]
      }

      const varName = match[1]
      const valueExpr = match[2].trim()

      // Evaluate the value expression
      let value: any

      // Check if it's a number
      if (/^-?\d+(\.\d+)?$/.test(valueExpr)) {
        value = Number(valueExpr)
      }
      // Check if it's a string (in quotes)
      else if (valueExpr.startsWith('"') && valueExpr.endsWith('"')) {
        value = valueExpr.substring(1, valueExpr.length - 1)
      }
      // Check if it's a boolean
      else if (valueExpr === "TRUE" || valueExpr === "true") {
        value = true
      } else if (valueExpr === "FALSE" || valueExpr === "false") {
        value = false
      }
      // Check if it's a variable reference
      else if (valueExpr.startsWith("?")) {
        if (this.variables.has(valueExpr)) {
          value = this.variables.get(valueExpr)
        } else {
          return [`Variable ${valueExpr} not defined`]
        }
      }
      // Otherwise, treat as a string
      else {
        value = valueExpr
      }

      this.variables.set(varName, value)
      return [`Variable ${varName} bound to ${this.formatValue(value)}`]
    } catch (error) {
      console.error("Error in bind command:", error)
      return [`Error in bind command: ${(error as Error).message}`]
    }
  }

  // Loop-for-count implementation
  private loopForCount(command: string): string[] {
    try {
      // Extract loop variable, start, end, and actions
      // Format: (loop-for-count (?c 1 5) do (printout t ?c crlf))
      const loopRegex = /$$loop-for-count\s+\(\s*(\?\w+)\s+(\d+)\s+(\d+)\s*$$(?:\s+do)?\s+(.*)\)/s
      const match = command.match(loopRegex)

      if (!match) {
        console.log("Loop regex failed to match:", command)
        return ["Invalid loop-for-count syntax"]
      }

      const varName = match[1]
      const startIndex = Number.parseInt(match[2])
      const endIndex = Number.parseInt(match[3])
      const actions = match[4].trim()

      const results: string[] = []

      // Execute the loop
      for (let i = startIndex; i <= endIndex; i++) {
        // Bind the loop variable
        this.variables.set(varName, i)

        // Execute the actions
        if (actions.startsWith("(printout")) {
          const printResult = this.executePrintout(actions)
          results.push(...printResult)
        } else {
          // For other actions, try to execute as a general command
          const actionResult = this.executeCommand(actions)
          results.push(...actionResult)
        }
      }

      return results
    } catch (error) {
      console.error("Error in loop-for-count:", error)
      return [`Error in loop-for-count: ${(error as Error).message}`]
    }
  }

  // If-then-else implementation
  private ifThenElse(command: string): string[] {
    try {
      // Extract condition, then actions, and else actions
      // Format: (if (> ?n 5) then (printout t "Greater than 5") else (printout t "Smaller than 5"))
      const ifRegex = /$$if\s+(.*?)\s+then\s+(.*?)(?:\s+else\s+(.*))?$$/s
      const match = command.match(ifRegex)

      if (!match) {
        console.log("If regex failed to match:", command)
        return ["Invalid if-then-else syntax"]
      }

      const condition = match[1].trim()
      const thenActions = match[2].trim()
      const elseActions = match[3] ? match[3].trim() : ""

      // Evaluate the condition
      const conditionResult = this.evaluateCondition(condition)

      if (conditionResult) {
        // Execute then actions
        return this.executeCommand(thenActions)
      } else if (elseActions) {
        // Execute else actions
        return this.executeCommand(elseActions)
      }

      return ["Condition evaluated"]
    } catch (error) {
      console.error("Error in if-then-else:", error)
      return [`Error in if-then-else: ${(error as Error).message}`]
    }
  }

  // Condition evaluation
  private evaluateCondition(condition: string): boolean {
    try {
      // If condition is already a boolean
      if (condition === "TRUE" || condition === "true") {
        return true
      } else if (condition === "FALSE" || condition === "false") {
        return false
      }

      // If condition is a variable reference
      if (condition.startsWith("?")) {
        if (this.variables.has(condition)) {
          const value = this.variables.get(condition)
          return Boolean(value)
        } else {
          throw new Error(`Variable ${condition} not defined`)
        }
      }

      // If condition is an expression
      if (condition.startsWith("(")) {
        const result = this.executeCommand(condition)
        if (result.length > 0) {
          return result[0] === "TRUE" || result[0] === "true" || result[0] === "1"
        }
        return false
      }

      // Default to false for unknown conditions
      return false
    } catch (error) {
      console.error("Error evaluating condition:", error)
      return false
    }
  }

  // Helper to execute printout actions
  private executePrintout(printout: string): string[] {
    try {
      // Extract content from (printout t "text" ?var crlf)
      const printoutRegex = /$$printout\s+(\w+)\s+(.*)$$/s
      const match = printout.match(printoutRegex)

      if (!match) {
        console.log("Printout regex failed to match:", printout)
        return ["Invalid printout syntax"]
      }

      const destination = match[1] // t, nil, etc.
      const content = match[2].trim()

      // Split by spaces but respect quotes
      const parts: string[] = []
      let currentPart = ""
      let inQuotes = false

      for (let i = 0; i < content.length; i++) {
        const char = content[i]

        if (char === '"') {
          inQuotes = !inQuotes
          currentPart += char
        } else if (char === " " && !inQuotes) {
          if (currentPart) {
            parts.push(currentPart)
            currentPart = ""
          }
        } else {
          currentPart += char
        }
      }

      if (currentPart) {
        parts.push(currentPart)
      }

      // Process each part
      let result = ""

      for (const part of parts) {
        if (part === "crlf") {
          result += "\n"
        } else if (part.startsWith('"') && part.endsWith('"')) {
          // String literal
          result += part.substring(1, part.length - 1)
        } else if (part.startsWith("?")) {
          // Variable reference
          if (this.variables.has(part)) {
            const value = this.variables.get(part)
            result += this.formatValue(value)
          } else {
            result += `<undefined:${part}>`
          }
        } else {
          result += part
        }
      }

      return [result]
    } catch (error) {
      console.error("Error in printout:", error)
      return [`Error in printout: ${(error as Error).message}`]
    }
  }

  // Basic arithmetic operations
  private add(command: string): string[] {
    try {
      // Extract numbers from (+ 1 2 3)
      const numbers = this.extractNumbers(command)
      if (numbers.length === 0) return ["Invalid operands"]

      const result = numbers.reduce((sum, num) => sum + num, 0)
      return [result.toString()]
    } catch (error) {
      return ["Error in addition operation"]
    }
  }

  private subtract(command: string): string[] {
    try {
      const numbers = this.extractNumbers(command)
      if (numbers.length === 0) return ["Invalid operands"]

      let result = numbers[0]
      for (let i = 1; i < numbers.length; i++) {
        result -= numbers[i]
      }
      return [result.toString()]
    } catch (error) {
      return ["Error in subtraction operation"]
    }
  }

  private multiply(command: string): string[] {
    try {
      const numbers = this.extractNumbers(command)
      if (numbers.length === 0) return ["Invalid operands"]

      const result = numbers.reduce((product, num) => product * num, 1)
      return [result.toString()]
    } catch (error) {
      return ["Error in multiplication operation"]
    }
  }

  private divide(command: string): string[] {
    try {
      const numbers = this.extractNumbers(command)
      if (numbers.length === 0) return ["Invalid operands"]

      let result = numbers[0]
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] === 0) return ["Division by zero error"]
        result /= numbers[i]
      }
      return [result.toString()]
    } catch (error) {
      return ["Error in division operation"]
    }
  }

  private extractNumbers(command: string): number[] {
    // Remove the outer parentheses and the operator
    const content = command.substring(1).trim()
    const parts = content.split(/\s+/)

    // Skip the operator (first part) and convert the rest to numbers
    return parts
      .slice(1)
      .map((part) => {
        // Remove trailing parenthesis if present
        if (part.endsWith(")")) {
          part = part.substring(0, part.length - 1)
        }

        // Check if it's a variable
        if (part.startsWith("?")) {
          if (this.variables.has(part)) {
            const value = this.variables.get(part)
            return typeof value === "number" ? value : Number.NaN
          }
          return Number.NaN
        }

        return Number(part)
      })
      .filter((num) => !isNaN(num))
  }

  // Comparison operations
  private evaluateComparison(command: string, operator: string): string[] {
    try {
      const operands = this.extractOperands(command)
      if (operands.length !== 2) {
        return ["Comparison requires exactly two operands"]
      }

      const [left, right] = operands

      // Convert to numbers if both are numeric
      const leftNum = typeof left === "number" ? left : Number(left)
      const rightNum = typeof right === "number" ? right : Number(right)

      let result: boolean

      if (!isNaN(leftNum) && !isNaN(rightNum)) {
        // Numeric comparison
        switch (operator) {
          case ">":
            result = leftNum > rightNum
            break
          case "<":
            result = leftNum < rightNum
            break
          case "=":
            result = leftNum === rightNum
            break
          case ">=":
            result = leftNum >= rightNum
            break
          case "<=":
            result = leftNum <= rightNum
            break
          case "!=":
            result = leftNum !== rightNum
            break
          default:
            return [`Unknown operator: ${operator}`]
        }
      } else {
        // String comparison
        const leftStr = String(left)
        const rightStr = String(right)

        switch (operator) {
          case ">":
            result = leftStr > rightStr
            break
          case "<":
            result = leftStr < rightStr
            break
          case "=":
            result = leftStr === rightStr
            break
          case ">=":
            result = leftStr >= rightStr
            break
          case "<=":
            result = leftStr <= rightStr
            break
          case "!=":
            result = leftStr !== rightStr
            break
          default:
            return [`Unknown operator: ${operator}`]
        }
      }

      return [result ? "TRUE" : "FALSE"]
    } catch (error) {
      return [`Error in comparison operation: ${(error as Error).message}`]
    }
  }

  // Equality operations
  private evaluateEquality(command: string, operator: string): string[] {
    try {
      const operands = this.extractOperands(command)
      if (operands.length !== 2) {
        return [`${operator} requires exactly two operands`]
      }

      const [left, right] = operands

      let result: boolean

      if (operator === "eq") {
        // Strict equality (type and value)
        result = left === right
      } else {
        // neq
        // Strict inequality
        result = left !== right
      }

      return [result ? "TRUE" : "FALSE"]
    } catch (error) {
      return [`Error in ${operator} operation: ${(error as Error).message}`]
    }
  }

  // Extract operands from a command
  private extractOperands(command: string): any[] {
    // Remove the outer parentheses and the operator
    const match = command.match(/$$\s*(\S+)\s+(.*)$$/)
    if (!match) {
      throw new Error("Invalid command format")
    }

    const operandsStr = match[2]
    const operands: any[] = []

    let currentOperand = ""
    let inQuotes = false
    let depth = 0

    for (let i = 0; i < operandsStr.length; i++) {
      const char = operandsStr[i]

      if (char === '"') {
        inQuotes = !inQuotes
        currentOperand += char
      } else if (char === "(" && !inQuotes) {
        depth++
        currentOperand += char
      } else if (char === ")" && !inQuotes) {
        depth--
        currentOperand += char
      } else if (char === " " && !inQuotes && depth === 0) {
        if (currentOperand) {
          operands.push(this.resolveOperand(currentOperand))
          currentOperand = ""
        }
      } else {
        currentOperand += char
      }
    }

    if (currentOperand) {
      operands.push(this.resolveOperand(currentOperand))
    }

    return operands
  }

  // Resolve an operand to its value
  private resolveOperand(operand: string): any {
    // Check if it's a number
    if (/^-?\d+(\.\d+)?$/.test(operand)) {
      return Number(operand)
    }
    // Check if it's a string (in quotes)
    else if (operand.startsWith('"') && operand.endsWith('"')) {
      return operand.substring(1, operand.length - 1)
    }
    // Check if it's a boolean
    else if (operand === "TRUE" || operand === "true") {
      return true
    } else if (operand === "FALSE" || operand === "false") {
      return false
    }
    // Check if it's a variable reference
    else if (operand.startsWith("?")) {
      if (this.variables.has(operand)) {
        return this.variables.get(operand)
      } else {
        throw new Error(`Variable ${operand} not defined`)
      }
    }
    // Otherwise, return as is
    return operand
  }

  private print(command: string): string[] {
    try {
      // Extract content between quotes
      const match = command.match(/"([^"]*)"/)
      if (match) {
        return [match[1]]
      }

      // If no quotes, try to extract the rest of the content
      const content = command.substring(7, command.length - 1).trim()

      // Check if it's a variable reference
      if (content.startsWith("?")) {
        if (this.variables.has(content)) {
          const value = this.variables.get(content)
          return [this.formatValue(value)]
        } else {
          return [`Variable ${content} not defined`]
        }
      }

      return [content]
    } catch (error) {
      return [`Error in print: ${(error as Error).message}`]
    }
  }

  private listFacts(): string[] {
    if (this.facts.size === 0) {
      return ["No facts in the system"]
    }

    const result: string[] = ["Facts:"]
    this.facts.forEach((value, key) => {
      result.push(`f-${key}: ${value}`)
    })
    return result
  }

  private listRules(): string[] {
    if (this.rules.size === 0) {
      return ["No rules in the system"]
    }

    const result: string[] = ["Rules:"]
    this.rules.forEach((value, key) => {
      result.push(`${key}: ${value.description}`)
    })
    return result
  }

  private clear(): string[] {
    this.facts.clear()
    this.rules.clear()
    this.variables.clear()
    this.factCounter = 0

    // Reinitialize built-in constants
    this.variables.set("TRUE", true)
    this.variables.set("FALSE", false)
    this.variables.set("nil", null)

    return ["CLIPS system cleared"]
  }

  private assertFact(command: string): string[] {
    try {
      // Remove outer parentheses: (assert (fact)) -> assert (fact)
      let content = command.substring(1, command.length - 1).trim()

      // Remove 'assert' keyword: assert (fact) -> (fact)
      content = content.substring(6).trim()

      // If content starts with '(' and ends with ')', remove them
      if (content.startsWith("(") && content.endsWith(")")) {
        content = content.substring(1, content.length - 1).trim()
      }

      if (content.length === 0) {
        return ["Empty fact not allowed"]
      }

      // Resolve variables in the fact
      let resolvedContent = content
      const varMatches = content.match(/\?\w+/g)
      if (varMatches) {
        for (const varName of varMatches) {
          if (this.variables.has(varName)) {
            const value = this.variables.get(varName)
            resolvedContent = resolvedContent.replace(varName, this.formatValue(value))
          }
        }
      }

      this.factCounter++
      this.facts.set(String(this.factCounter), resolvedContent)

      return [`Fact asserted: f-${this.factCounter}`]
    } catch (error) {
      return [`Error in assert: ${(error as Error).message}`]
    }
  }

  private defineRule(command: string): string[] {
    try {
      // Extract rule name
      const nameMatch = command.match(/$$defrule\s+([^\s$$]+)/)
      if (!nameMatch) {
        return ["Invalid rule name"]
      }

      const ruleName = nameMatch[1]

      // Check if rule already exists
      if (this.rules.has(ruleName)) {
        return [`Rule '${ruleName}' already exists. Use a unique name.`]
      }

      // Store the rule
      this.rules.set(ruleName, {
        description: command,
        // In a real implementation, we would parse conditions and actions
      })

      return [`Rule '${ruleName}' defined`]
    } catch (error) {
      return [`Error in rule definition: ${(error as Error).message}`]
    }
  }

  private retractFact(command: string): string[] {
    try {
      // Extract fact ID
      const match = command.match(/$$retract\s+f-?(\d+)\s*$$/)
      if (!match) {
        return ["Invalid fact ID"]
      }

      const factId = match[1]
      if (this.facts.has(factId)) {
        this.facts.delete(factId)
        return [`Fact f-${factId} retracted`]
      } else {
        return [`Fact f-${factId} not found`]
      }
    } catch (error) {
      return [`Error in retract: ${(error as Error).message}`]
    }
  }

  private run(): string[] {
    try {
      // In a real implementation, this would evaluate rules against facts
      // For now, we'll just simulate rule activation

      if (this.rules.size === 0) {
        return ["No rules to execute"]
      }

      const results: string[] = ["Executing rules:"]
      let activations = 0

      this.rules.forEach((rule, ruleName) => {
        results.push(`Activated rule: ${ruleName}`)
        activations++
      })

      results.push(`Run complete. ${activations} rule(s) activated.`)
      return results
    } catch (error) {
      return [`Error during run: ${(error as Error).message}`]
    }
  }

  getFacts(): string[] {
    const result: string[] = []
    this.facts.forEach((value, key) => {
      result.push(`f-${key}: ${value}`)
    })
    return result
  }

  getRules(): string[] {
    const result: string[] = []
    this.rules.forEach((value, key) => {
      result.push(`${key}: ${value.description.substring(0, 50)}...`)
    })
    return result
  }

  getVariables(): string[] {
    const result: string[] = []
    this.variables.forEach((value, key) => {
      if (key !== "TRUE" && key !== "FALSE" && key !== "nil") {
        result.push(`${key}: ${this.formatValue(value)}`)
      }
    })
    return result
  }
}
