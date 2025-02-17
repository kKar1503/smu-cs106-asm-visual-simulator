import { TokenType } from "@/lexer/lexer";
import { OperandValidator } from "../validator";
import { BYTE_REGISTER_SET, DWORD_REGISTER_SET, QWORD_REGISTER_SET, WORD_REGISTER_SET } from "@/lexer/register";

const variantRegisterSet: Record<string, Set<string>> = {
    B: BYTE_REGISTER_SET,
    W: WORD_REGISTER_SET,
    L: DWORD_REGISTER_SET,
    Q: QWORD_REGISTER_SET,
};

const movExtensionOperandsValidator: OperandValidator = function (instructionVariant, operands) {
    switch (instructionVariant) {
        case "ZBW":
        case "ZBL":
        case "ZBQ":
        case "ZWL":
        case "ZWQ":
        case "SBW":
        case "SBL":
        case "SBQ":
        case "SWL":
        case "SWQ":
        case "SLQ":
            const [, srcSize, dstSize] = instructionVariant.split(""); // Extract the size from the variant
            const src = operands[0];
            const dst = operands[1];
            if (src.type === TokenType.IMMEDIATE) {
                return new Error(`Source operand cannot be an immediate for variant ${instructionVariant}`);
            }
            if (dst.type !== TokenType.REGISTER) {
                return new Error(`Destination operand must be a register for variant ${instructionVariant}`);
            }
            if (src.type === TokenType.REGISTER) {
                const srcRegister: any = src.value.value; // Cast for any cause Set .has method expects the type to match
                if (!variantRegisterSet[srcSize].has(srcRegister)) {
                    return new Error(`Invalid source register for variant ${instructionVariant}: ${srcRegister}`);
                }
            }
            const dstRegister: any = dst.value.value; // Cast for any cause Set .has method expects the type to match
            if (!variantRegisterSet[dstSize].has(dstRegister)) {
                return new Error(`Invalid destination register for variant ${instructionVariant}: ${dstRegister}`);
            }
    }

    return null;
};

export default movExtensionOperandsValidator;
