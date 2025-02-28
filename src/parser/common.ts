import { TokenType, RegisterTokenValue, ImmediateTokenValue, MemoryTokenValue, InstructionTokenValue } from "@/lexer/lexer";

export enum AssmeblyNodeType {
    INSTRUCTION = "INSTRUCTION",
    LABEL = "LABEL",
}

export type InstructionNode = {
    type: AssmeblyNodeType.INSTRUCTION;
    instruction: InstructionTokenValue;
    operands: Operand[];
};

export type LabelNode = {
    type: AssmeblyNodeType.LABEL;
    label: string;
};

export type AssemblyLabels = Map<string, number>;

export type AssemblyNode = InstructionNode | LabelNode;

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
