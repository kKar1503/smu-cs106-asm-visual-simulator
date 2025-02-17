import { SUPPORTED_INSTRUCTIONS } from "@/interpreter/instruction";
import { SUPPORTED_VARIANTS } from "@/interpreter/variant";
import { InstructionNode } from "./common";

export type InstructionValidator = (node: InstructionNode) => Error | null;

export interface InstructionValidationSchema {
    instruction: (typeof SUPPORTED_INSTRUCTIONS)[number];
    supportedVariants: (typeof SUPPORTED_VARIANTS)[number][];
    operandCounts: number[];
    validators: InstructionValidator[];
}
