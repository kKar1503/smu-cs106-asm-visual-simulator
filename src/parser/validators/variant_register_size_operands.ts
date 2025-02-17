import { TokenType } from "@/lexer/lexer";
import { OperandValidator } from "../validator";
import { variantRegisterSet } from "./common";

const variantRegisterOperandSizeValidator: OperandValidator = function (instructionVariant, operands) {
    switch (instructionVariant) {
        case "B":
        case "W":
        case "L":
        case "Q":
            // Validating the B, W, L, and Q variants
            for (const operand of operands) {
                if (operand.type !== TokenType.REGISTER) {
                    // We only care about register operands
                    continue;
                }

                const register: any = operand.value.value; // Cast for any cause Set .has method expects the type to match

                if (!variantRegisterSet[instructionVariant].has(register)) {
                    return new Error(`Invalid register for variant ${instructionVariant}: ${register}`);
                }
            }
    }

    return null;
};

export default variantRegisterOperandSizeValidator;
