import { TokenType } from "@/lexer/lexer";
import { OperandValidator } from "../validator";
import { BYTE_REGISTER_SET, DWORD_REGISTER_SET, QWORD_REGISTER_SET, WORD_REGISTER_SET } from "@/lexer/register";

const variantRegisterSet: Record<string, Set<string>> = {
    B: BYTE_REGISTER_SET,
    W: WORD_REGISTER_SET,
    L: DWORD_REGISTER_SET,
    Q: QWORD_REGISTER_SET,
};

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
