import { TokenType } from "@/lexer/lexer";
import { OperandValidator } from "../validator";
import { QWORD_REGISTER_SET } from "@/lexer/register";

const absqOperandsValidator: OperandValidator = function (instructionVariant, operands) {
    if (instructionVariant === "ABSQ") {
        if (operands[0].type !== TokenType.IMMEDIATE || operands[1].type !== TokenType.REGISTER) {
            return new Error("Variant ABSQ expects an immediate and a register");
        }

        const register: any = operands[1].value.value; // Cast for any cause Set .has method expects the type to match

        if (!QWORD_REGISTER_SET.has(register)) {
            return new Error(`Invalid register for variant ${instructionVariant}: ${register}`);
        }
    }

    return null;
};

export default absqOperandsValidator;
