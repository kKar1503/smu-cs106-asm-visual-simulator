import { TokenType } from "@/lexer/lexer";
import { InstructionValidator } from "../validator";
import { QWORD_REGISTER_SET } from "@/lexer/register";

const absqOperandsValidator: InstructionValidator = function (node) {
    if (node.instruction.variant === "ABSQ") {
        if (node.operands[0].type !== TokenType.IMMEDIATE || node.operands[1].type !== TokenType.REGISTER) {
            return new Error("Variant ABSQ expects an immediate and a register");
        }

        if (node.operands[0].value.value > 0xffffffffffffffffn) {
            return new Error(`Invalid immediate for variant ${node.instruction.variant}: ${node.operands[0].value.value}`);
        }

        const register: any = node.operands[1].value.value; // Cast for any cause Set .has method expects the type to match

        if (!QWORD_REGISTER_SET.has(register)) {
            return new Error(`Invalid register for variant ${node.instruction.variant}: ${register}`);
        }
    }

    return null;
};

export default absqOperandsValidator;
