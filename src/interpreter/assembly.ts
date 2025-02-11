import type { Action } from "./action";
import MovInterpreter from "./mov";

const SUPPORTED_INSTRUCTIONS = [
    "MOV",
    "LEA",
    "INC",
    "DEC",
    "NEG",
    "NOT",
    "ADD",
    "SUB",
    "AND",
    "OR",
    "XOR",
    "SAL",
    "SAR",
    "SHR",
] as const;

type InstructionType = (typeof SUPPORTED_INSTRUCTIONS)[number];

export default class AssmeblyInterpreter {
    private code: string;
    private lines: string[];
    private lineIndex: number = 0;

    constructor(code: string) {
        this.code = code;
        this.lines = this.code.split("\n");
    }

    public reset() {
        this.lineIndex = 0;
    }

    private next() {
        this.lineIndex++;
    }

    public hasNext(): boolean {
        return this.lineIndex < this.lines.length;
    }

    public getCurrentActions(): [instruction: string, interpreter: string, actions: Action[]] {
        const instruction = this.interpreteCurrentLine();
        this.next();
        return instruction;
    }

    private interpreteCurrentLine(): [instruction: string, interpreter: string, actions: Action[]] {
        const line = this.getCurrentLine();
        const instructionType = this.getCurrentInstructionType(line);
        switch (instructionType) {
            case "MOV":
                return [line, ...new MovInterpreter(line).interprete()];
            default:
                return [line, "", []];
        }
    }

    private getCurrentLine(): string {
        return this.lines[this.lineIndex];
    }

    private getCurrentInstructionType(line: string): InstructionType {
        for (const supportedInstruction of SUPPORTED_INSTRUCTIONS) {
            if (line.toUpperCase().startsWith(supportedInstruction)) {
                return supportedInstruction;
            }
        }

        throw new Error(`Unsupported instruction: ${line}`);
    }
}
