import { SIZE_VARIANTS } from "@/lexer/variant";

export class Memory {
    /**
     * Memory is an array of bigints.
     *
     * Although each memory space is only 1 byte, but it is easier to do operations
     * on bigints than on number, since we will have to deal with up to 64bit
     * for all our instruction operations.
     */
    private memory: bigint[] = [];

    constructor(count: number) {
        this.memory = new Array(count).fill(0n);
    }

    public read(address: bigint, variant: (typeof SIZE_VARIANTS)[number]): bigint {
        const addr = Number(address);

        switch (variant) {
            case "B": // Byte (8-bit)
                return this.memory[addr] & 0xffn;
            case "W": // Word (16-bit)
                return (this.memory[addr] & 0xffn) | ((this.memory[addr + 1] & 0xffn) << 8n);
            case "L": // Long (32-bit)
                return (
                    (this.memory[addr] & 0xffn) |
                    ((this.memory[addr + 1] & 0xffn) << 8n) |
                    ((this.memory[addr + 2] & 0xffn) << 16n) |
                    ((this.memory[addr + 3] & 0xffn) << 24n)
                );
            case "Q": // Quad (64-bit)
                return (
                    (this.memory[addr] & 0xffn) |
                    ((this.memory[addr + 1] & 0xffn) << 8n) |
                    ((this.memory[addr + 2] & 0xffn) << 16n) |
                    ((this.memory[addr + 3] & 0xffn) << 24n) |
                    ((this.memory[addr + 4] & 0xffn) << 32n) |
                    ((this.memory[addr + 5] & 0xffn) << 40n) |
                    ((this.memory[addr + 6] & 0xffn) << 48n) |
                    ((this.memory[addr + 7] & 0xffn) << 56n)
                );
        }
    }

    public write(address: bigint, value: bigint, variant: (typeof SIZE_VARIANTS)[number]) {
        const addr = Number(address);

        switch (variant) {
            case "B": // Byte (8-bit)
                this.memory[addr] = value & 0xffn;
                break;
            case "W": // Word (16-bit)
                this.memory[addr] = value & 0xffn;
                this.memory[addr + 1] = (value >> 8n) & 0xffn;
                break;
            case "L": // Long (32-bit)
                this.memory[addr] = value & 0xffn;
                this.memory[addr + 1] = (value >> 8n) & 0xffn;
                this.memory[addr + 2] = (value >> 16n) & 0xffn;
                this.memory[addr + 3] = (value >> 24n) & 0xffn;
                break;
            case "Q": // Quad (64-bit)
                this.memory[addr] = value & 0xffn;
                this.memory[addr + 1] = (value >> 8n) & 0xffn;
                this.memory[addr + 2] = (value >> 16n) & 0xffn;
                this.memory[addr + 3] = (value >> 24n) & 0xffn;
                this.memory[addr + 4] = (value >> 32n) & 0xffn;
                this.memory[addr + 5] = (value >> 40n) & 0xffn;
                this.memory[addr + 6] = (value >> 48n) & 0xffn;
                this.memory[addr + 7] = (value >> 56n) & 0xffn;
                break;
        }
    }
}

export default Memory;
