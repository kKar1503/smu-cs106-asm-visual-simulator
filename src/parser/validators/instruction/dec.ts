import { SIZE_VARIANTS } from "@/lexer/variant";
import { InstructionValidationSchema } from "@/parser/validator";
import validMemoryOperandsValidator from "../valid_memory_operands";
import validCombinationsOperandsValidator from "../valid_combinations_operands";
import { TokenType } from "@/lexer/lexer";
import variantRegisterSizeOperandsValidator from "../variant_register_size_operands";
import variantMemoryDisplacementSizeOperandsValidator from "../variant_memory_displacement_size_operands";

const validator: InstructionValidationSchema = {
    instruction: "DEC",
    supportedVariants: [...SIZE_VARIANTS],
    operandCounts: [1],
    validators: [
        validMemoryOperandsValidator,
        validCombinationsOperandsValidator([TokenType.REGISTER], [TokenType.MEMORY]),
        variantRegisterSizeOperandsValidator,
        variantMemoryDisplacementSizeOperandsValidator,
    ],
};

export default validator;
