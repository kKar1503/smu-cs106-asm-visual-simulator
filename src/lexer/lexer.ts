import { SUPPORTED_INSTRUCTIONS } from "./instruction";
import { REGISTERS, SUPPORTED_REGISTERS } from "./register";
import { SUPPORTED_VARIANTS, VARIANTS } from "./variant";

export enum TokenType {
    INSTRUCTION = "INSTRUCTION", // MOVL, MOVB, MOVQ, etc.
    REGISTER = "REGISTER", // %rax, %rbx, etc.
    IMMEDIATE = "IMMEDIATE", // $0x10, $42
    MEMORY = "MEMORY", // 0x10, (0x10), imm(rb, ri, scale)
    COMMA = "COMMA", // ,
    NEWLINE = "NEWLINE", // \n
    EOF = "EOF", // End of file
}

export type RegisterTokenValue = {
    token: string;
    value: (typeof SUPPORTED_REGISTERS)[number];
};

export type RegisterToken = {
    type: TokenType.REGISTER;
    value: RegisterTokenValue;
};

export type ImmediateTokenValue = {
    token: string;
    value: bigint;
};

export type ImmediateToken = {
    type: TokenType.IMMEDIATE;
    value: ImmediateTokenValue;
};

export type InstructionTokenValue = {
    token: string;
    instruction: (typeof SUPPORTED_INSTRUCTIONS)[number];
    variant?: (typeof SUPPORTED_VARIANTS)[number];
};

export type InstructionToken = {
    type: TokenType.INSTRUCTION;
    value: InstructionTokenValue;
};

export type MemoryTokenValue = {
    token: string;
    displacement?: bigint;
    base?: (typeof SUPPORTED_REGISTERS)[number];
    index?: Exclude<(typeof SUPPORTED_REGISTERS)[number], "RSP">;
    scale?: 1n | 2n | 4n | 8n;
};

export type MemoryToken = {
    type: TokenType.MEMORY;
    value: MemoryTokenValue;
};

export type Token =
    | {
          type: TokenType.COMMA | TokenType.NEWLINE | TokenType.EOF;
      }
    | RegisterToken
    | ImmediateToken
    | InstructionToken
    | MemoryToken;

export class Lexer {
    private source: string;
    private position: number = 0;
    private _tokens: Token[] = [];

    constructor(source: string) {
        this.source = source;
    }

    private isWhitespace(char: string): boolean {
        return char === " " || char === "\t";
    }

    private isNewline(char: string): boolean {
        return char === "\n";
    }

    private isComma(char: string): boolean {
        return char === ",";
    }

    private isLParen(char: string): boolean {
        return char === "(";
    }

    private isRParen(char: string): boolean {
        return char === ")";
    }

    private isDigit(char: string): boolean {
        return char >= "0" && char <= "9";
    }

    private isHexDigit(char: string): boolean {
        return this.isDigit(char) || (char >= "a" && char <= "f") || (char >= "A" && char <= "F");
    }

    private isLetter(char: string): boolean {
        return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
    }

    private isAlphanumeric(char: string): boolean {
        return this.isLetter(char) || this.isDigit(char);
    }

    private isHexPrefix(str: string): boolean {
        return str === "0x" || str === "0X";
    }

    private isRegisterStart(char: string): boolean {
        return char === "%";
    }

    private isImmediateStart(char: string): boolean {
        return char === "$";
    }

    private isMemoryStart(char: string): boolean {
        return char === "(" || this.isDigit(char) || char === "-";
    }

    private isCommentStart(char: string): boolean {
        return char === "#";
    }

    private parseMemoryAddressingScale(scale: string): 1n | 2n | 4n | 8n {
        if (scale !== "1" && scale !== "2" && scale !== "4" && scale !== "8") {
            throw new Error(`Invalid scale: \"${scale}\"`);
        }

        return BigInt(scale) as 1n | 2n | 4n | 8n;
    }

    private parseInstructionVariant(token: string): InstructionTokenValue {
        for (const instruction of SUPPORTED_INSTRUCTIONS) {
            if (token.startsWith(instruction)) {
                const variant = token.slice(instruction.length);
                if (variant === "") {
                    return { token, instruction };
                }

                if (this.isVariant(variant)) {
                    return { token, instruction, variant };
                }
            }
        }
        throw new Error(`Unsupported instruction: \"${token}\"`);
    }

    private parseMemory(token: string, displacement: string, addressing: string): MemoryTokenValue {
        const value: MemoryTokenValue = {
            token: token.replaceAll(" ", ""), // Remove whitespace
        };
        if (displacement !== "") {
            value.displacement = BigInt(displacement);
        }

        if (addressing !== "") {
            const addressingWithoutParen = addressing
                .slice(1, -1)
                .split(",")
                .map((s) => s.trim());
            switch (addressingWithoutParen.length) {
                case 1: {
                    const baseUpper = addressingWithoutParen[0].toUpperCase();
                    if (baseUpper.length < 3) {
                        throw new Error(`Invalid base register: \"${baseUpper}\"`);
                    }
                    const prefix = baseUpper[0];
                    const register = baseUpper.slice(1);
                    if (this.isRegisterStart(prefix) && this.isRegister(register)) {
                        value.base = register;
                        break;
                    }
                    throw new Error(`Invalid base register: \"${baseUpper}\"`);
                }
                case 2: {
                    const [base, index] = addressingWithoutParen;
                    if (base.length < 3) {
                        throw new Error(`Invalid base register: \"${base}\"`);
                    }
                    if (index.length < 3) {
                        throw new Error(`Invalid index register: \"${index}\"`);
                    }
                    const basePrefix = base[0];
                    const indexPrefix = index[0];
                    const baseRegister = base.slice(1).toUpperCase();
                    const indexRegister = index.slice(1).toUpperCase();
                    if (this.isRegisterStart(basePrefix) && this.isRegister(baseRegister)) {
                        value.base = baseRegister;
                        if (this.isRegisterStart(indexPrefix) && this.isRegister(indexRegister) && indexRegister !== "RSP") {
                            value.index = indexRegister;
                            break;
                        }
                        throw new Error(`Invalid index register: \"${index}\"`);
                    }
                    throw new Error(`Invalid base register: \"${base}\"`);
                }
                case 3: {
                    const [base, index, scale] = addressingWithoutParen;
                    if (index.length < 3) {
                        throw new Error(`Invalid index register: \"${index}\"`);
                    }
                    value.scale = this.parseMemoryAddressingScale(scale);
                    const indexPrefix = index[0];
                    const indexRegister = index.slice(1).toUpperCase();
                    if (this.isRegisterStart(indexPrefix) && this.isRegister(indexRegister) && indexRegister !== "RSP") {
                        value.index = indexRegister;
                        if (base === "") {
                            break;
                        }
                        if (base.length < 3) {
                            throw new Error(`Invalid base register: \"${base}\"`);
                        }
                        const basePrefix = base[0];
                        const baseRegister = base.slice(1).toUpperCase();
                        if (this.isRegisterStart(basePrefix) && this.isRegister(baseRegister)) {
                            value.base = baseRegister;
                            break;
                        }
                        throw new Error(`Invalid base register: \"${base}\"`);
                    }
                    throw new Error(`Invalid index register: \"${index}\"`);
                }
                default:
                    throw new Error(`Invalid addressing: \"${addressing}\"`);
            }
        }

        return value;
    }

    private isVariant(variant: string): variant is (typeof SUPPORTED_VARIANTS)[number] {
        return VARIANTS.has(variant as any);
    }

    private isRegister(register: string): register is (typeof SUPPORTED_REGISTERS)[number] {
        return REGISTERS.has(register as any);
    }

    private advance(): string {
        return this.source[this.position++];
    }

    private advanceCount(count: number): string {
        const result = this.source.slice(this.position, this.position + count);
        this.position += count;
        return result;
    }

    private peek(): string {
        return this.source[this.position] || "";
    }

    private peekCount(count: number): string {
        return this.source.slice(this.position, this.position + count);
    }

    private consumeWhile(predicate: (char: string) => boolean): string {
        let result = "";
        while (this.position < this.source.length && !this.isNewline(this.peek()) && predicate(this.peek())) {
            result += this.advance();
        }
        return result;
    }

    private consumeInstruction(): Token {
        const word = this.consumeWhile(this.isLetter);
        const upperWord = word.toUpperCase();
        const value = this.parseInstructionVariant(upperWord); // throws

        return {
            type: TokenType.INSTRUCTION,
            value,
        };
    }

    private consumeRegister(): Token {
        this.advance(); // Consume '%'
        const register = this.consumeWhile((c) => this.isAlphanumeric(c));
        const upperRegister = register.toUpperCase();
        if (this.isRegister(upperRegister)) {
            return {
                type: TokenType.REGISTER,
                value: {
                    token: "%" + upperRegister,
                    value: upperRegister,
                },
            };
        }
        throw new Error(`Unexpected register: \"${upperRegister}\"`);
    }

    private consumeImmediate(): Token {
        const immediatePrefix = this.advance(); // Consume $
        let immediate = "";
        let isHex = false;
        if (this.isHexPrefix(this.peekCount(2))) {
            immediate += this.advanceCount(2); // Consume "0x"
            immediate += this.consumeWhile((c) => this.isHexDigit(c));
            isHex = true;
        } else {
            if (this.peek() === "-") {
                immediate += this.advance(); // Consume '-'
            }
            immediate += this.consumeWhile(this.isDigit);
        }
        if (immediate === "") {
            throw new Error("Empty immediate");
        }

        const value = BigInt(immediate);
        const immediateUpper = isHex ? "0x" + immediate.slice(2).toUpperCase() : immediate;
        return {
            type: TokenType.IMMEDIATE,
            value: {
                token: immediatePrefix + immediateUpper,
                value,
            },
        };
    }

    private consumeMemory(): Token {
        let memory = "";
        // Handles the displacement first, if there is
        if (this.isHexPrefix(this.peekCount(2))) {
            // Hex displacement
            memory += this.advanceCount(2); // Consume "0x"
            memory += this.consumeWhile((c) => this.isHexDigit(c)).toUpperCase();
        } else if (this.peek() === "-") {
            // Negative decimal displacement
            memory += this.advance(); // Consume '-'
            memory += this.consumeWhile(this.isDigit);
        } else if (this.isDigit(this.peek())) {
            // Decimal displacement
            memory += this.consumeWhile(this.isDigit);
        }
        const displacement = memory;
        if (!this.isWhitespace(this.peek()) && !this.isComma(this.peek()) && !this.isLParen(this.peek())) {
            throw new Error('Missing "(" in memory addressing');
        }

        let addressing = "";
        // Handles the register, if there is, determined by the presence of '('
        if (this.isLParen(this.peek())) {
            addressing += this.advance(); // Consume '('
            addressing += this.consumeWhile((c) => !this.isRParen(c) && !this.isNewline(c)).toUpperCase();
            if (this.isNewline(this.peek())) {
                throw new Error('Missing ")" in memory addressing');
            }
            addressing += this.advance(); // Consume ')'
            memory += addressing;
        }
        const value = this.parseMemory(memory, displacement, addressing); // throws
        return {
            type: TokenType.MEMORY,
            value,
        };
    }

    private consumeComment(): void {
        // TODO: Currently comments are not stored in the tokens
        this.advance(); // Consume '#'
        this.consumeWhile((c) => !this.isNewline(c));
    }

    public tokenize(): Token[] {
        while (this.position < this.source.length) {
            // Skip leading whitespace and newlines
            if (!this.isWhitespace(this.peek()) && !this.isNewline(this.peek())) {
                break;
            }
            this.advance();
        }
        while (this.position < this.source.length) {
            const char = this.peek();

            if (this.isWhitespace(char)) {
                this.advance();
                continue;
            }

            if (this.isComma(char)) {
                this._tokens.push({ type: TokenType.COMMA });
                this.advance();
                continue;
            }

            if (this.isNewline(char)) {
                this.advance();
                // Skip if consecutive newlines
                if (this._tokens.length === 0 || this._tokens[this._tokens.length - 1].type !== TokenType.NEWLINE) {
                    this._tokens.push({ type: TokenType.NEWLINE });
                }
                continue;
            }

            if (this.isCommentStart(char)) {
                this.consumeComment();
                continue;
            }

            if (this.isLetter(char)) {
                this._tokens.push(this.consumeInstruction());

                if (this.position >= this.source.length || !this.isWhitespace(this.peek())) {
                    throw new Error("Expected whitespace after instruction");
                }

                this.consumeWhile(this.isWhitespace);

                continue;
            }

            if (this.isRegisterStart(char)) {
                this._tokens.push(this.consumeRegister());

                continue;
            }

            if (this.isImmediateStart(char)) {
                this._tokens.push(this.consumeImmediate());
                continue;
            }

            if (this.isMemoryStart(char)) {
                this._tokens.push(this.consumeMemory());
                continue;
            }

            throw new Error(`Unexpected character: \"${char}\"`);
        }

        if (this._tokens.length === 0) {
            this._tokens.push({ type: TokenType.EOF });
        } else {
            if (this._tokens[this._tokens.length - 1].type === TokenType.NEWLINE) {
                // Replace the last newline token with EOF
                this._tokens[this._tokens.length - 1] = { type: TokenType.EOF };
            } else {
                this._tokens.push({ type: TokenType.EOF });
            }
        }

        return this._tokens;
    }

    get tokens(): Token[] {
        return this._tokens;
    }
}

export default Lexer;
