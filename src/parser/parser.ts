import { SUPPORTED_INSTRUCTIONS } from "@/interpreter/instruction";
import { SUPPORTED_VARIANTS } from "@/interpreter/variant";
import { Token, TokenType, MemoryTokenValue } from "@/lexer/lexer";
import { AssemblyNode, InstructionNode, Operand } from "./common";
import instructionValidatorsMap, { InstructionParseValidationSchema } from "./validators/instruction";

const instructionOperandCounts: { [ix in (typeof SUPPORTED_INSTRUCTIONS)[number]]: number } = {
    MOV: 2,
    LEA: 2,
    INC: 1,
    DEC: 1,
    NEG: 1,
    NOT: 1,
    ADD: 2,
    SUB: 2,
    AND: 2,
    OR: 2,
    XOR: 2,
    SAL: 2,
    SAR: 2,
    SHR: 2,
};

export class Parser {
    private tokens: Token[];
    private position: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private current(): Token {
        return this.tokens[this.position];
    }

    private consume(): Token {
        return this.tokens[this.position++];
    }

    private expect<TT extends TokenType>(type: TT): Extract<Token, { type: TT }> {
        const token = this.consume();
        if (token.type !== type) {
            throw new Error(`Expected token type ${type}, but got ${token.type}`);
        }
        return token as Extract<Token, { type: TT }>;
    }

    private consumeOperand(): Operand {
        const token = this.current();
        switch (token.type) {
            case TokenType.REGISTER:
            case TokenType.IMMEDIATE:
            case TokenType.MEMORY:
                this.consume();
                return { type: token.type, value: token.value } as Operand;
            default:
                throw new Error(`Unexpected token type in operand: ${token.type}`);
        }
    }

    private validateInstructionBySchema(node: InstructionNode, schema: InstructionParseValidationSchema) {
        const { instruction, variant } = node.instruction;
        if (variant === undefined) {
            // Currently, we expect all instructions to have a variant,
            // this seems to be what CS106 expects.
            return;
        }

        // Validate that the instruction match
        if (schema.instruction !== instruction) {
            throw new Error(`Invalid instruction for schema: ${instruction}`);
        }

        // Validate that the variant is supported
        if (!schema.supportedVariants.has(variant)) {
            throw new Error(`Invalid variant for instruction: ${variant}`);
        }

        // Validate the number of operands
        if (!schema.operandCounts.includes(node.operands.length)) {
            throw new Error(
                `Invalid number of operands for instruction (${node.instruction.instruction}): ${node.operands.length}, expected: ${schema.operandCounts.join(",")}`,
            );
        }

        // Validate the instruction node
        for (const instructionValidator of schema.validators) {
            const error = instructionValidator(node);
            if (error !== null) {
                throw error;
            }
        }
    }

    private validateSingleOperandMemorySize(variant: (typeof SUPPORTED_VARIANTS)[number], memory: MemoryTokenValue) {
        // There is no way for us to detect the validity of the memory address in the
        // register at the parser level, so we will have to leave it to runtime.
        if (
            memory.displacement !== undefined &&
            memory.base === undefined &&
            memory.index === undefined &&
            memory.scale === undefined
        ) {
            // This is just purely a displacement, which we can actually validate
            // but we will just validate for alignment.
            // Althought memory alignment is not a must, but I think in CS106, they kinda
            // wanna enforce that, so I'll add it as a validation.
            switch (variant) {
                case "B":
                    break;
                case "W":
                    if (memory.displacement % 2n !== 0n) {
                        throw new Error(`Invalid displacement for variant W: ${memory.displacement}`);
                    }
                    break;
                case "L":
                    if (memory.displacement % 4n !== 0n) {
                        throw new Error(`Invalid displacement for variant L: ${memory.displacement}`);
                    }
                    break;
                case "Q":
                    if (memory.displacement % 8n !== 0n) {
                        throw new Error(`Invalid displacement for variant Q: ${memory.displacement}`);
                    }
                    break;
                default:
                    throw new Error(`Invalid variant for instruction with single operand: ${variant}`);
            }
        }
    }

    private convertNegativeImmediateToPositive(variant: (typeof SUPPORTED_VARIANTS)[number], immediateValue: bigint) {
        // Immediate can only be in the first operand, so for the extension ones, we will
        // just extract the size from the first size (i.e. ZBW -> B).
        switch (variant) {
            case "B":
            case "ZBW":
            case "ZBL":
            case "ZBQ":
            case "SBW":
            case "SBL":
            case "SBQ":
                if (immediateValue < 0n) {
                    return immediateValue + (1n << 8n);
                }
                break;
            case "W":
            case "ZWL":
            case "ZWQ":
            case "SWL":
            case "SWQ":
                if (immediateValue < 0n) {
                    return immediateValue + (1n << 16n);
                }
                break;
            case "L":
            case "SLQ":
            case "Q": // The only support for 64bit immediate is in the ABSQ variant
                if (immediateValue < 0n) {
                    return immediateValue + (1n << 32n);
                }
                break;
            case "ABSQ":
                if (immediateValue < 0n) {
                    return immediateValue + (1n << 64n);
                }
                break;
        }
        return immediateValue;
    }

    public parseLine(): AssemblyNode {
        if (this.current().type === TokenType.EOF) {
            return null;
        }

        const instructionToken = this.expect(TokenType.INSTRUCTION);
        const instructionNode: InstructionNode = {
            instruction: instructionToken.value,
            operands: [],
        };

        const firstOperand = this.consumeOperand(); // Instruction must have at least one operand
        instructionNode.operands.push(firstOperand);
        while (this.current().type !== TokenType.NEWLINE && this.current().type !== TokenType.EOF) {
            this.expect(TokenType.COMMA);
            instructionNode.operands.push(this.consumeOperand());
        }

        if (this.current().type === TokenType.NEWLINE) {
            this.consume(); // Consume NEWLINE not EOF
        }

        // We will convert all negative immediate values to positive values in 2's complement
        for (const operand of instructionNode.operands) {
            if (operand.type === TokenType.IMMEDIATE) {
                operand.value.value = this.convertNegativeImmediateToPositive(
                    instructionNode.instruction.variant ?? "Q",
                    operand.value.value,
                );
            } else if (operand.type === TokenType.MEMORY) {
                if (operand.value.displacement !== undefined) {
                    operand.value.displacement = this.convertNegativeImmediateToPositive(
                        instructionNode.instruction.variant ?? "Q",
                        operand.value.displacement,
                    );
                }
            }
        }

        const validationSchema = instructionValidatorsMap.get(instructionNode.instruction.instruction);
        if (validationSchema === undefined) {
            // Shouldn't throw here, we should have implemented everything.
            throw new Error(`No validation schema for instruction ${instructionNode.instruction.instruction}`);
        }

        this.validateInstructionBySchema(instructionNode, validationSchema);

        return instructionNode;
    }
}

export default Parser;
