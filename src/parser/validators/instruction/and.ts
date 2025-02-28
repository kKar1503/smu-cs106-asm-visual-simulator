import { SIZE_VARIANTS } from "@/lexer/variant";
import { InstructionValidationSchema } from "@/parser/validator";
import validMemoryOperandsValidator from "../valid_memory_operands";
import validCombinationsOperandsValidator from "../valid_combinations_operands";
import { TokenType } from "@/lexer/lexer";
import variantRegisterSizeOperandsValidator from "../variant_register_size_operands";
import variantMemoryDisplacementSizeOperandsValidator from "../variant_memory_displacement_size_operands";

const validator: InstructionValidationSchema = {
    instruction: "AND",
    supportedVariants: [...SIZE_VARIANTS],
    operandCounts: [2],
    validators: [
        validMemoryOperandsValidator,
        validCombinationsOperandsValidator(
            [TokenType.IMMEDIATE, TokenType.REGISTER],
            [TokenType.IMMEDIATE, TokenType.MEMORY],
            [TokenType.REGISTER, TokenType.REGISTER],
            [TokenType.REGISTER, TokenType.MEMORY],
            [TokenType.MEMORY, TokenType.REGISTER],
        ),
        variantRegisterSizeOperandsValidator,
        variantMemoryDisplacementSizeOperandsValidator,
    ],
};

export default validator;
