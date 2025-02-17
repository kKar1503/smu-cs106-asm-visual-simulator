import { TokenType } from "@/lexer/lexer";
import { OperandValidator } from "../validator";

type OperandType = TokenType.REGISTER | TokenType.IMMEDIATE | TokenType.MEMORY;
type Combination = [OperandType] | [OperandType, OperandType];
type CombinationOperandValidator = (...combinations: Combination[]) => OperandValidator;

const validCombinationsOperandsValidator: CombinationOperandValidator = function (combinations) {
    return function (_instructionVariant, operands) {
        const operandTypes = operands.map((operand) => operand.type);
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

        return new Error(`Invalid combination of operands: ${operands.map((operand) => operand.type).join(", ")}`);
    };
};

export default validCombinationsOperandsValidator;
