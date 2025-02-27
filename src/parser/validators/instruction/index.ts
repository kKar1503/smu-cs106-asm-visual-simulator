import { SUPPORTED_INSTRUCTIONS } from "@/interpreter/instruction";
import { SUPPORTED_VARIANTS } from "@/interpreter/variant";
import { InstructionValidationSchema } from "@/parser/validator";
import MovValidator from "./mov";
import IncValidator from "./inc";
import DecValidator from "./dec";
import NegValidator from "./neg";
import NotValidator from "./not";

export type InstructionParseValidationSchema = Omit<InstructionValidationSchema, "supportedVariants"> & {
    supportedVariants: Set<(typeof SUPPORTED_VARIANTS)[number]>; // change this to set for faster lookup and deduplication
};

const instructionValidators: Map<(typeof SUPPORTED_INSTRUCTIONS)[number], InstructionParseValidationSchema> = new Map();

function setInstructionValidationSchema(schema: InstructionValidationSchema) {
    const parseSchema: InstructionParseValidationSchema = {
        ...schema,
        supportedVariants: new Set(schema.supportedVariants),
    };
    instructionValidators.set(schema.instruction, parseSchema);
}

// Set instructions
setInstructionValidationSchema(MovValidator);
setInstructionValidationSchema(IncValidator);
setInstructionValidationSchema(DecValidator);
setInstructionValidationSchema(NegValidator);
setInstructionValidationSchema(NotValidator);

export default instructionValidators;
