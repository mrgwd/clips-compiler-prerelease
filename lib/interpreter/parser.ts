import type { Token } from "./tokenizer";

export type NodeType =
  | "Program"
  | "Expression"
  | "Literal"
  | "Variable"
  | "Symbol"
  | "Identifier";

export interface Node {
  type: NodeType;
  value?: string | number;
  children?: Node[];
}

export function parse(tokens: Token[]): Node {
  let position = 0;

  function peek(): Token | null {
    return position < tokens.length ? tokens[position] : null;
  }

  function consume(): Token {
    return tokens[position++];
  }

  function parseExpression(): Node {
    const token = peek();
    if (!token) throw new Error("Unexpected end of input");

    if (token.type === "LPAREN") {
      consume(); // Consume the left parenthesis
      const expression: Node = {
        type: "Expression",
        children: [],
      };

      // Parse the operator/function name
      const operatorToken = peek();
      if (!operatorToken) throw new Error("Unexpected end of input after '('");

      // Special case for loop-for-count which has a nested expression as first argument
      if (
        operatorToken.type === "IDENTIFIER" &&
        operatorToken.value === "loop-for-count"
      ) {
        expression.children = [parseAtom()];

        // Continue parsing arguments
        while (position < tokens.length && peek()?.type !== "RPAREN") {
          expression.children.push(parseAtom());
        }
      }
      // Normal case - operator followed by arguments
      else if (
        operatorToken.type === "IDENTIFIER" ||
        operatorToken.type === "SYMBOL"
      ) {
        expression.children = [parseAtom()];

        // Parse arguments
        while (position < tokens.length && peek()?.type !== "RPAREN") {
          expression.children.push(parseAtom());
        }
      } else {
        throw new Error(
          `Expected identifier or symbol, got ${operatorToken.type}`
        );
      }

      if (peek()?.type !== "RPAREN") {
        throw new Error("Expected closing parenthesis");
      }
      consume(); // Consume the right parenthesis

      return expression;
    } else {
      return parseAtom();
    }
  }

  function parseAtom(): Node {
    const token = peek();
    if (!token) throw new Error("Unexpected end of input");

    consume(); // Consume the token

    if (token.type === "LPAREN") {
      position--; // Put back the token
      return parseExpression();
    } else if (token.type === "NUMBER") {
      return {
        type: "Literal",
        value: Number.parseFloat(token.value),
      };
    } else if (token.type === "STRING") {
      return {
        type: "Literal",
        value: token.value,
      };
    } else if (token.type === "VARIABLE") {
      return {
        type: "Variable",
        value: token.value,
      };
    } else if (token.type === "IDENTIFIER") {
      return {
        type: "Identifier",
        value: token.value,
      };
    } else if (token.type === "SYMBOL") {
      return {
        type: "Symbol",
        value: token.value,
      };
    } else {
      throw new Error(`Unexpected token type: ${token.type}`);
    }
  }

  const program: Node = {
    type: "Program",
    children: [],
  };

  while (position < tokens.length) {
    program?.children?.push(parseExpression());
  }

  return program;
}
