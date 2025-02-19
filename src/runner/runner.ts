import config from "@/config/config";
import { AssemblyLabels, AssemblyNode, AssmeblyNodeType, Operand } from "@/parser/common";
import Memory from "./memory";
import Registers from "./registers";
import Flags from "./flags";
import { MemoryTokenValue, RegisterTokenValue, TokenType } from "@/lexer/lexer";
import { SIZE_VARIANTS, SUPPORTED_VARIANTS } from "@/lexer/variant";
import { SUPPORTED_REGISTERS } from "@/interpreter/register";
import { variantMask, variantSignFlagShifts } from "./common";

export class Runner {
    private nodes: AssemblyNode[];
    private labels: AssemblyLabels;

    constructor(nodes: AssemblyNode[], labels: AssemblyLabels) {
        this.nodes = nodes;
        this.labels = labels;
    }

    /**
     * Runs the parsed assembly nodes.
     * This method does not produce any output, it only run the entire instruction
     * node to basically do a sanity check that the assembly code is runnable.
     *
     * Recommended to call this prior to assemble() to ensure that the assembly code
     * is valid.
     *
     * Think of this as a runtime check, for certain things like whether the memory
     * access is valid, etc. (This is here since in CS106 we learned to do memory
     * alignment though in reality this is not necessary.) This is also useful for
     * checking things like infinite loops.
     *
     * However, this method is going to presume all nodes are valid on compile level
     * by the parser and lexer. So it should not be validating that XXX instruction
     * should have n operands, etc.
     */
    public run() {
        const memory = new Memory(config.MEMORY_COUNT);
        const registers = new Registers();
        const flags = new Flags();

        for (const node of this.nodes) {
            if (node.type === AssmeblyNodeType.INSTRUCTION) {
                // Run the instruction
                switch (node.instruction.instruction) {
                    case "MOV": {
                        this.mov(registers, memory, node.operands, node.instruction.variant!);
                        break;
                    }
                    case "LEA": {
                        const memoryTokenValue = node.operands[0].value as MemoryTokenValue;
                        const reg = (node.operands[1].value as RegisterTokenValue).value;
                        const address = this.calculateMemoryAddress(registers, memoryTokenValue);
                        registers.setRegisterValue(reg, address, "Q");
                        break;
                    }
                    case "INC": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        const originalValue = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                        const newValue = originalValue + 1n;
                        switch (node.operands[0].type) {
                            case TokenType.REGISTER:
                                const reg = node.operands[0].value.value;
                                registers.setRegisterValue(reg, newValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, node.operands[0].value), newValue, variant);
                                break;
                        }
                    }
                    case "DEC": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        const originalValue = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                        const newValue = originalValue - 1n;
                        switch (node.operands[0].type) {
                            case TokenType.REGISTER:
                                const reg = node.operands[0].value.value;
                                registers.setRegisterValue(reg, newValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, node.operands[0].value), newValue, variant);
                                break;
                        }
                    }
                    case "NEG": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        const originalValue = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                        const newValue = ~originalValue + 1n;
                        switch (node.operands[0].type) {
                            case TokenType.REGISTER:
                                const reg = node.operands[0].value.value;
                                registers.setRegisterValue(reg, newValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, node.operands[0].value), newValue, variant);
                                break;
                        }
                    }
                    case "NOT": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        const originalValue = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                        const newValue = ~originalValue;
                        switch (node.operands[0].type) {
                            case TokenType.REGISTER:
                                const reg = node.operands[0].value.value;
                                registers.setRegisterValue(reg, newValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, node.operands[0].value), newValue, variant);
                                break;
                        }
                    }
                    case "ADD": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        const src = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                        const dst = this.deriveOperandValue(registers, memory, node.operands[1], variant);
                        const newValue = dst + src;
                        switch (node.operands[1].type) {
                            case TokenType.REGISTER:
                                const reg = node.operands[1].value.value;
                                registers.setRegisterValue(reg, newValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, node.operands[1].value), newValue, variant);
                                break;
                        }
                    }
                    case "SUB": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        const src = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                        const dst = this.deriveOperandValue(registers, memory, node.operands[1], variant);
                        const newValue = dst - src;
                        switch (node.operands[1].type) {
                            case TokenType.REGISTER:
                                const reg = node.operands[1].value.value;
                                registers.setRegisterValue(reg, newValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, node.operands[1].value), newValue, variant);
                                break;
                        }
                    }
                    case "AND": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        const src = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                        const dst = this.deriveOperandValue(registers, memory, node.operands[1], variant);
                        const newValue = dst & src;
                        switch (node.operands[1].type) {
                            case TokenType.REGISTER:
                                const reg = node.operands[1].value.value;
                                registers.setRegisterValue(reg, newValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, node.operands[1].value), newValue, variant);
                                break;
                        }
                    }
                    case "OR": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        const src = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                        const dst = this.deriveOperandValue(registers, memory, node.operands[1], variant);
                        const newValue = dst | src;
                        switch (node.operands[1].type) {
                            case TokenType.REGISTER:
                                const reg = node.operands[1].value.value;
                                registers.setRegisterValue(reg, newValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, node.operands[1].value), newValue, variant);
                                break;
                        }
                    }
                    case "XOR": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        const src = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                        const dst = this.deriveOperandValue(registers, memory, node.operands[1], variant);
                        const newValue = dst ^ src;
                        switch (node.operands[1].type) {
                            case TokenType.REGISTER:
                                const reg = node.operands[1].value.value;
                                registers.setRegisterValue(reg, newValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, node.operands[1].value), newValue, variant);
                                break;
                        }
                    }
                    case "SAL": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        let src: bigint;
                        let dst: Operand;
                        if (node.operands.length === 1) {
                            src = 1n;
                            dst = node.operands[0];
                        } else {
                            src = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                            dst = node.operands[1];
                        }
                        const dstValue = this.deriveOperandValue(registers, memory, dst, variant);
                        const newValue = dstValue << src;
                        const maskedValue = newValue & variantMask[variant];
                        switch (dst.type) {
                            case TokenType.REGISTER:
                                const reg = dst.value.value;
                                registers.setRegisterValue(reg, maskedValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, dst.value), maskedValue, variant);
                                break;
                        }
                    }
                    case "SAR": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        let src: bigint;
                        let dst: Operand;
                        if (node.operands.length === 1) {
                            src = 1n;
                            dst = node.operands[0];
                        } else {
                            src = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                            dst = node.operands[1];
                        }
                        const dstValue = this.deriveOperandValue(registers, memory, dst, variant);
                        const originalSignBit = dstValue & (1n << variantSignFlagShifts[variant]);
                        const newValue = dstValue >> src;
                        const maskedValue = newValue;
                        switch (dst.type) {
                            case TokenType.REGISTER:
                                const reg = dst.value.value;
                                registers.setRegisterValue(reg, maskedValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, dst.value), maskedValue, variant);
                                break;
                        }
                    }
                    case "SHR": {
                        const variant = node.instruction.variant! as (typeof SIZE_VARIANTS)[number];
                        let src: bigint;
                        let dst: Operand;
                        if (node.operands.length === 1) {
                            src = 1n;
                            dst = node.operands[0];
                        } else {
                            src = this.deriveOperandValue(registers, memory, node.operands[0], variant);
                            dst = node.operands[1];
                        }
                        const dstValue = this.deriveOperandValue(registers, memory, dst, variant);
                        const newValue = dstValue >> src;
                        const maskedValue = newValue & variantMask[variant];
                        switch (dst.type) {
                            case TokenType.REGISTER:
                                const reg = dst.value.value;
                                registers.setRegisterValue(reg, maskedValue, variant);
                                break;
                            case TokenType.MEMORY:
                                memory.write(this.calculateMemoryAddress(registers, dst.value), maskedValue, variant);
                                break;
                        }
                    }
                }
            }
        }
    }

    /**
     * Assembles the parsed assembly nodes.
     * This method produces the output of the assembly code, which is in an array of
     * actions. Each action is a node that will help the client to render the animation
     * of the assembly code on the visualiser.
     *
     * Recommended to call run() prior to this to ensure that the assembly code is
     * valid.
     */
    public assemble() {}

    private getMovVariantPair(
        variant: (typeof SUPPORTED_VARIANTS)[number],
    ): [(typeof SIZE_VARIANTS)[number], (typeof SIZE_VARIANTS)[number]] {
        switch (variant) {
            case "B":
            case "W":
            case "L":
            case "Q":
                return [variant, variant];
            case "ABSQ":
                return ["Q", "Q"];
            case "ZBW":
            case "ZBL":
            case "ZBQ":
            case "ZWL":
            case "ZWQ":
            case "SBW":
            case "SBL":
            case "SBQ":
            case "SWL":
            case "SWQ":
            case "SLQ":
                return [
                    variant.charAt(1) as (typeof SIZE_VARIANTS)[number],
                    variant.charAt(2) as (typeof SIZE_VARIANTS)[number],
                ];
        }
    }

    private deriveOperandValue(
        registers: Registers,
        memory: Memory,
        operand: Operand,
        variant: (typeof SIZE_VARIANTS)[number],
    ): bigint {
        switch (operand.type) {
            case TokenType.REGISTER:
                return registers.getRegisterValue(operand.value.value, variant);
            case TokenType.IMMEDIATE:
                return operand.value.value;
            case TokenType.MEMORY:
                this.validateMemoryAlignment(registers, variant, operand.value);
                const address = this.calculateMemoryAddress(registers, operand.value);
                return memory.read(address, variant);
        }
    }

    private calculateMemoryAddress(registers: Registers, memoryTokenValue: MemoryTokenValue): bigint {
        let address = 0n;
        if (memoryTokenValue.base !== undefined) {
            address += registers.getRegisterValue(memoryTokenValue.base, "Q");
        }
        if (memoryTokenValue.index !== undefined) {
            address += registers.getRegisterValue(memoryTokenValue.index, "Q") * memoryTokenValue.scale!;
        }
        if (memoryTokenValue.displacement !== undefined) {
            address += memoryTokenValue.displacement;
        }
        return address;
    }

    private mov(registers: Registers, memory: Memory, operands: Operand[], variant: (typeof SUPPORTED_VARIANTS)[number]) {
        const [src, dst] = operands;
        const [srcSize, dstSize] = this.getMovVariantPair(variant);
        const srcValue = this.deriveOperandValue(registers, memory, src, srcSize);
        switch (dst.type) {
            case TokenType.REGISTER:
                if (variant === "ABSQ") {
                    // ABSQ supports 64bit immediate to 64bit register
                    registers.setRegisterValue(dst.value.value, srcValue, "Q");
                } else if (variant === "Q" && src.type === TokenType.IMMEDIATE) {
                    // Q register will sign extend for the upper 32 bits if the src is immediate
                    registers.setRegisterValue(dst.value.value, this.signExtend(srcValue, "L", "Q"), "Q");
                } else if (variant === "L") {
                    // L register will pad the upper 32 bits with 0s
                    registers.setRegisterValue(dst.value.value, srcValue, "Q");
                } else {
                    if (this.isSignExtendVariant(variant)) {
                        registers.setRegisterValue(dst.value.value, this.signExtend(srcValue, srcSize, dstSize), dstSize);
                    } else {
                        registers.setRegisterValue(dst.value.value, srcValue, dstSize);
                    }
                }
                break;
            case TokenType.MEMORY:
                this.validateMemoryAlignment(registers, dstSize, dst.value);
                const address = this.calculateMemoryAddress(registers, dst.value);
                if (variant === "Q" && src.type === TokenType.IMMEDIATE) {
                    memory.write(address, this.signExtend(srcValue, "L", "Q"), "Q");
                } else {
                    memory.write(address, srcValue, dstSize);
                }
                break;
        }
    }

    private isSignExtendVariant(variant: (typeof SUPPORTED_VARIANTS)[number]) {
        return variant.startsWith("S");
    }

    private signExtend(value: bigint, from: (typeof SIZE_VARIANTS)[number], to: (typeof SIZE_VARIANTS)[number]) {
        switch (from) {
            case "B":
                switch (to) {
                    case "W":
                        return (value & 0x80n) === 0x80n ? value | 0xff00n : value;
                    case "L":
                        return (value & 0x80n) === 0x80n ? value | 0xffffff00n : value;
                    case "Q":
                        return (value & 0x80n) === 0x80n ? value | 0xffffffffffffff00n : value;
                }
            case "W":
                switch (to) {
                    case "L":
                        return (value & 0x8000n) === 0x8000n ? value | 0xffff0000n : value;
                    case "Q":
                        return (value & 0x8000n) === 0x8000n ? value | 0xffffffffffff0000n : value;
                }
            case "L":
                switch (to) {
                    case "Q":
                        return (value & 0x80000000n) === 0x80000000n ? value | 0xffffffff00000000n : value;
                }
        }
        return value;
    }

    private validateMemoryAlignment(
        registers: Registers,
        variant: (typeof SIZE_VARIANTS)[number],
        memoryTokenValue: MemoryTokenValue,
    ) {
        const base = memoryTokenValue.base !== undefined ? registers.getRegisterValue(memoryTokenValue.base, "Q") : 0n;
        let size: bigint;
        switch (variant) {
            case "B":
                size = 1n;
                break;
            case "W":
                size = 2n;
                break;
            case "L":
                size = 4n;
                break;
            case "Q":
                size = 8n;
                break;
        }
        if (base % size !== 0n) {
            throw new Error(`Invalid base register alignment for variant ${variant}: ${base}`);
        }
    }
}

export default Runner;
