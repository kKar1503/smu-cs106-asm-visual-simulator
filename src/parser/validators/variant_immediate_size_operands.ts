import { TokenType } from "@/lexer/lexer";
import { OperandValidator } from "../validator";
import { variantImmediateMaxSize } from "./common";

const variantRegisterOperandSizeValidator: OperandValidator = function (instructionVariant, operands) {
    switch (instructionVariant) {
        case "B":
        case "W":
        case "L":
        case "Q":
            // Validating the B, W, L, and Q variants
            const operand = operands[0]; // immediate operand can only be the first operand
            if (operand.type === TokenType.IMMEDIATE) {
                // We only care about immediate operands
                const immediate = operand.value.value;

                if (immediate > variantImmediateMaxSize[instructionVariant]) {
                    return new Error(`Invalid immediate for variant ${instructionVariant}: ${immediate}`);
                }
            }
    }

    return null;
};

export default variantRegisterOperandSizeValidator;
