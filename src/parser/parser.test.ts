import { it, expect } from "vitest";
import { AssemblyNode, Parser } from "./parser";
import { Token, TokenType, ImmediateTokenValue } from "@/lexer/lexer";

it("should throw error when the instruction has no operands", () => {
    const tokens: Token[] = [
        { type: TokenType.INSTRUCTION, value: { token: "MOVQ", instruction: "MOV", variant: "Q" } },
        { type: TokenType.NEWLINE },
        { type: TokenType.EOF },
    ];
    const parser = new Parser(tokens);
    expect(() => parser.parseLine()).toThrow("Unexpected token type in operand: NEWLINE");
});

it("should parse an instruction with a single register operand", () => {
    const tokens: Token[] = [
        { type: TokenType.INSTRUCTION, value: { token: "INCQ", instruction: "INC", variant: "Q" } },
        { type: TokenType.REGISTER, value: { token: "%RAX", value: "RAX" } },
        { type: TokenType.NEWLINE },
        { type: TokenType.EOF },
    ];
    const parser = new Parser(tokens);
    const node = parser.parseLine();
    const expected: AssemblyNode = {
        instruction: { token: "INCQ", instruction: "INC", variant: "Q" },
        operands: [{ type: TokenType.REGISTER, value: { token: "%RAX", value: "RAX" } }],
    };
    expect(node).toStrictEqual(expected);
});

it("should parse an instruction with multiple operands separated by commas", () => {
    const tokens: Token[] = [
        { type: TokenType.INSTRUCTION, value: { token: "MOVQ", instruction: "MOV", variant: "Q" } },
        { type: TokenType.REGISTER, value: { token: "%RAX", value: "RAX" } },
        { type: TokenType.COMMA },
        { type: TokenType.REGISTER, value: { token: "%RBX", value: "RBX" } },
        { type: TokenType.NEWLINE },
        { type: TokenType.EOF },
    ];
    const parser = new Parser(tokens);
    const node = parser.parseLine();
    const expected: AssemblyNode = {
        instruction: { token: "MOVQ", instruction: "MOV", variant: "Q" },
        operands: [
            { type: TokenType.REGISTER, value: { token: "%RAX", value: "RAX" } },
            { type: TokenType.REGISTER, value: { token: "%RBX", value: "RBX" } },
        ],
    };
    expect(node).toStrictEqual(expected);
});

it("should throw an error if operands are not separated by a comma", () => {
    const tokens: Token[] = [
        { type: TokenType.INSTRUCTION, value: { token: "MOVQ", instruction: "MOV", variant: "Q" } },
        { type: TokenType.REGISTER, value: { token: "%RAX", value: "RAX" } },
        { type: TokenType.REGISTER, value: { token: "%RBX", value: "RBX" } }, // Missing COMMA
        { type: TokenType.NEWLINE },
        { type: TokenType.EOF },
    ];
    const parser = new Parser(tokens);
    expect(() => parser.parseLine()).toThrow("Expected token type COMMA");
});

it("should handle an instruction with an immediate operand", () => {
    const immediateValue: ImmediateTokenValue = { token: "$10", value: 10n };
    const tokens: Token[] = [
        { type: TokenType.INSTRUCTION, value: { token: "MOVQ", instruction: "MOV", variant: "Q" } },
        { type: TokenType.IMMEDIATE, value: immediateValue },
        { type: TokenType.COMMA },
        { type: TokenType.REGISTER, value: { token: "%RAX", value: "RAX" } },
        { type: TokenType.NEWLINE },
        { type: TokenType.EOF },
    ];
    const parser = new Parser(tokens);
    const node = parser.parseLine();
    const expected: AssemblyNode = {
        instruction: { token: "MOVQ", instruction: "MOV", variant: "Q" },
        operands: [
            { type: TokenType.IMMEDIATE, value: immediateValue },
            { type: TokenType.REGISTER, value: { token: "%RAX", value: "RAX" } },
        ],
    };
    expect(node).toStrictEqual(expected);
});
