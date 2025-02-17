import { TokenType } from "@/lexer/lexer";
import { InstructionValidator } from "../validator";
import { variantImmediateMaxSize } from "./common";

const variantRegisterOperandSizeValidator: InstructionValidator = function (node) {
    switch (node.instruction.variant) {
        case "B":
        case "W":
        case "L":
        case "Q":
            // Validating the B, W, L, and Q variants
            const operand = node.operands[0]; // immediate operand can only be the first operand
            if (operand.type === TokenType.IMMEDIATE) {
                // We only care about immediate operands
                const immediate = operand.value.value;

                if (immediate > variantImmediateMaxSize[node.instruction.variant]) {
                    return new Error(`Invalid immediate for variant ${node.instruction.variant}: ${immediate}`);
                }
            }
    }

    return null;
};

export default variantRegisterOperandSizeValidator;
