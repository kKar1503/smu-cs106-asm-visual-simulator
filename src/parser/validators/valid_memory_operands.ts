import { OperandValidator } from "../validator";

const validMemoryOperandsValidator: OperandValidator = function (_instructionVariant, _operands) {
    //TODO: This is not implemented now, because technically our lexer has handled this
    // can consider moving the logic here to do the validation instead and reduce the
    // load from the lexer
    return null;
};

export default validMemoryOperandsValidator;
