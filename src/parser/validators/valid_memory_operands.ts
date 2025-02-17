import { InstructionValidator } from "../validator";

const validMemoryOperandsValidator: InstructionValidator = function (_node) {
    //TODO: This is not implemented now, because technically our lexer has handled this
    // can consider moving the logic here to do the validation instead and reduce the
    // load from the lexer
    return null;
};

export default validMemoryOperandsValidator;
