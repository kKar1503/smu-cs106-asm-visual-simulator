import { TokenType } from "@/lexer/lexer";
import { InstructionValidator } from "../validator";
import { variantImmediateMaxSize } from "./common";

const variantMemoryDisplacementSizeOperandsValidator: InstructionValidator = function (node) {
    switch (node.instruction.variant) {
        case "B":
        case "W":
        case "L":
        case "Q":
            // Validating the B, W, L, and Q variants
            for (const operand of node.operands) {
                if (operand.type !== TokenType.MEMORY) {
                    // We only care about memory operands
                    continue;
                }

                if (operand.value.displacement !== undefined) {
                    const displacement = operand.value.displacement;

                    if (displacement > variantImmediateMaxSize[node.instruction.variant]) {
                        return new Error(`Invalid displacement for variant ${node.instruction.variant}: ${displacement}`);
                    }
                }
            }
    }

    return null;
};

export default variantMemoryDisplacementSizeOperandsValidator;
