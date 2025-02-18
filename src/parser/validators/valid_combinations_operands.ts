import { TokenType } from "@/lexer/lexer";
import { InstructionValidator } from "../validator";

type OperandType = TokenType.REGISTER | TokenType.IMMEDIATE | TokenType.MEMORY;
type Combination = [OperandType] | [OperandType, OperandType];
type CombinationInstructionValidator = (...combinations: Combination[]) => InstructionValidator;

const validCombinationsOperandsValidator: CombinationInstructionValidator = function (...combinations) {
    return function (node) {
        const operandTypes = node.operands.map((operand) => operand.type);
        for (const combination of combinations) {
            if (combination.length !== operandTypes.length) {
                continue;
            }

            let valid = true;
            for (let i = 0; i < combination.length; i++) {
                if (combination[i] !== operandTypes[i]) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                return null;
            }
        }

        return new Error(
            `Invalid combination of operands for instruction and variant (${node.instruction.instruction}, ${node.instruction.variant}): ${node.operands.map((operand) => operand.type).join(", ")}`,
        );
    };
};

export default validCombinationsOperandsValidator;
