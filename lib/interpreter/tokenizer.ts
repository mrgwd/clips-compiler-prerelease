export type TokenType = "LPAREN" | "RPAREN" | "IDENTIFIER" | "VARIABLE" | "NUMBER" | "STRING" | "SYMBOL"

export interface Token {
  type: TokenType
  value: string
  position: number
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let position = 0

  while (position < input.length) {
    const char = input[position]

    // Skip whitespace
    if (/\s/.test(char)) {
      position++
      continue
    }

    // Handle parentheses
    if (char === "(") {
      tokens.push({ type: "LPAREN", value: "(", position })
      position++
      continue
    }

    if (char === ")") {
      tokens.push({ type: "RPAREN", value: ")", position })
      position++
      continue
    }

    // Handle strings
    if (char === '"') {
      let value = ""
      position++ // Skip opening quote

      while (position < input.length && input[position] !== '"') {
        value += input[position]
        position++
      }

      if (position < input.length) {
        position++ // Skip closing quote
      }

      tokens.push({ type: "STRING", value, position: position - value.length - 2 })
      continue
    }

    // Handle numbers
    if (/[0-9]/.test(char) || (char === "-" && /[0-9]/.test(input[position + 1] || ""))) {
      let value = char
      position++

      while (position < input.length && /[0-9.]/.test(input[position])) {
        value += input[position]
        position++
      }

      tokens.push({ type: "NUMBER", value, position: position - value.length })
      continue
    }

    // Handle variables (starting with ?)
    if (char === "?") {
      let value = char
      position++

      while (position < input.length && /[a-zA-Z0-9_]/.test(input[position])) {
        value += input[position]
        position++
      }

      tokens.push({ type: "VARIABLE", value, position: position - value.length })
      continue
    }

    // Handle identifiers and symbols
    if (/[a-zA-Z_+\-*/>=<!]/.test(char)) {
      let value = char
      position++

      while (position < input.length && /[a-zA-Z0-9_+\-*/>=<!$]/.test(input[position])) {
        value += input[position]
        position++
      }

      // Special operators are symbols
      if (["+", "-", "*", "/", ">", "<", "=", ">=", "<=", "!=", "eq", "neq"].includes(value)) {
        tokens.push({ type: "SYMBOL", value, position: position - value.length })
      } else {
        tokens.push({ type: "IDENTIFIER", value, position: position - value.length })
      }
      continue
    }

    // If we get here, we encountered an unexpected character
    throw new Error(`Unexpected character: ${char} at position ${position}`)
  }

  return tokens
}
