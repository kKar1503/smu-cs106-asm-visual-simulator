import { SUPPORTED_REGISTERS, DWORD_REGISTERS, QWORD_REGISTERS, WORD_REGISTERS, BYTE_REGISTERS } from "@/lexer/register";
import { SIZE_VARIANTS } from "@/lexer/variant";
import { variantMask } from "./common";

export class Registers {
    private registers: Map<(typeof QWORD_REGISTERS)[number], bigint>;

    constructor() {
        this.registers = new Map();
        for (const reg of QWORD_REGISTERS) {
            this.registers.set(reg, 0n);
        }
    }

    public getRegisterValue(register: (typeof SUPPORTED_REGISTERS)[number], variant: (typeof SIZE_VARIANTS)[number]): bigint {
        const reg = this.determineRegister(register, variant);
        return this.registers.get(reg)! & variantMask[variant];
    }

    /**
     * Set the value into the register based on the variant and register name.
     *
     * The value is expected validated to fit within range of the target register and variant size.
     */
    public setRegisterValue(
        register: (typeof SUPPORTED_REGISTERS)[number],
        value: bigint,
        variant: (typeof SIZE_VARIANTS)[number],
    ) {
        const reg = this.determineRegister(register, variant);
        const mask = variantMask[variant];
        const originalValue = this.registers.get(reg)! & ~mask;
        const newValue = value & mask;

        // Ensure that the result is 64bit
        this.registers.set(reg, (originalValue | newValue) & variantMask.Q);
    }

    private determineRegister(
        register: (typeof SUPPORTED_REGISTERS)[number],
        variant: (typeof SIZE_VARIANTS)[number],
    ): (typeof QWORD_REGISTERS)[number] {
        switch (variant) {
            case "B":
                return QWORD_REGISTERS[BYTE_REGISTERS.indexOf(register as any)];
            case "W":
                return QWORD_REGISTERS[WORD_REGISTERS.indexOf(register as any)];
            case "L":
                return QWORD_REGISTERS[DWORD_REGISTERS.indexOf(register as any)];
            case "Q":
                return register as (typeof QWORD_REGISTERS)[number];
        }
    }
}

export default Registers;
