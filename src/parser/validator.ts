import { SUPPORTED_INSTRUCTIONS } from "@/interpreter/instruction";
import { SUPPORTED_VARIANTS } from "@/interpreter/variant";
import { InstructionNode, Operand } from "./common";

export type OperandValidator = (instructionVariant: (typeof SUPPORTED_VARIANTS)[number], operands: Operand[]) => Error | null;

export type InstructionValidator = (instructionNode: InstructionNode) => Error | null;

export interface InstructionValidationSchema {
    instruction: (typeof SUPPORTED_INSTRUCTIONS)[number];
    supportedVariants: (typeof SUPPORTED_VARIANTS)[number][];
    operand: {
        count: number;
        validators: OperandValidator[];
    };
    validators: InstructionValidator[];
}
