import { SUPPORTED_INSTRUCTIONS } from "@/interpreter/instruction";
import { InstructionValidationSchema } from "@/parser/validator";
import MovValidator from "./mov";

const instructionValidators: Map<(typeof SUPPORTED_INSTRUCTIONS)[number], InstructionValidationSchema> = new Map();

instructionValidators.set("MOV", MovValidator);

export default instructionValidators;
