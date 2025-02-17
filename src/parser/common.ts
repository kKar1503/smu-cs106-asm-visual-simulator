import { TokenType, RegisterTokenValue, ImmediateTokenValue, MemoryTokenValue, InstructionTokenValue } from "@/lexer/lexer";

export type InstructionNode = {
    instruction: InstructionTokenValue;
    operands: Operand[];
};

export type AssemblyNode = InstructionNode | null;

export type Operand =
    | {
          type: TokenType.REGISTER;
          value: RegisterTokenValue;
      }
    | {
          type: TokenType.IMMEDIATE;
          value: ImmediateTokenValue;
      }
    | {
          type: TokenType.MEMORY;
          value: MemoryTokenValue;
      };
