import { TokenType } from "@/lexer/lexer";
import { InstructionValidator } from "../validator";
import { variantRegisterSet } from "./common";

const variantRegisterSizeOperandsValidator: InstructionValidator = function (node) {
    switch (node.instruction.variant) {
        case "B":
        case "W":
        case "L":
        case "Q":
            // Validating the B, W, L, and Q variants
            for (const operand of node.operands) {
                if (operand.type === TokenType.REGISTER) {
                    const register: any = operand.value.value; // Cast for any cause Set .has method expects the type to match

                    if (!variantRegisterSet[node.instruction.variant].has(register)) {
                        return new Error(`Invalid register for variant ${node.instruction.variant}: ${register}`);
                    }
                }
            }
    }

    return null;
};

export default variantRegisterSizeOperandsValidator;
