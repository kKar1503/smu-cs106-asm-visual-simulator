import { SUPPORTED_VARIANTS } from "@/interpreter/variant";
import { InstructionValidationSchema } from "@/parser/validator";

const validator: InstructionValidationSchema = {
    instruction: "MOV",
    supportedVariants: [...SUPPORTED_VARIANTS],
    operand: {
        counts: [2],
        validators: [],
    },
    validators: [],
};

export default validator;
