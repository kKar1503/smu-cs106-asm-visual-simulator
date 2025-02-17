import { TokenType } from "@/lexer/lexer";
import { OperandValidator } from "../validator";
import { variantImmediateMaxSize } from "./common";

const variantMemoryDisplacementSizeOperandsValidator: OperandValidator = function (instructionVariant, operands) {
    switch (instructionVariant) {
        case "B":
        case "W":
        case "L":
        case "Q":
            // Validating the B, W, L, and Q variants
            for (const operand of operands) {
                if (operand.type !== TokenType.MEMORY) {
                    // We only care about memory operands
                    continue;
                }

                if (operand.value.displacement !== undefined) {
                    const displacement = operand.value.displacement;

                    if (displacement > variantImmediateMaxSize[instructionVariant]) {
                        return new Error(`Invalid displacement for variant ${instructionVariant}: ${displacement}`);
                    }
                }
            }
    }

    return null;
};

export default variantMemoryDisplacementSizeOperandsValidator;
