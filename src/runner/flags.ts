import { SIZE_VARIANTS } from "@/lexer/variant";
import { variantSignFlagShifts } from "./common";

export class Flags {
    public ZF: bigint;
    public SF: bigint;
    public CF: bigint;
    public OF: bigint;

    constructor() {
        this.ZF = 0n;
        this.SF = 0n;
        this.CF = 0n;
        this.OF = 0n;
    }

    public setFlags(values: { ZF?: bigint; SF?: bigint; CF?: bigint; OF?: bigint }) {
        if (values.ZF !== undefined) {
            this.ZF = values.ZF;
        }
        if (values.SF !== undefined) {
            this.SF = values.SF;
        }
        if (values.CF !== undefined) {
            this.CF = values.CF;
        }
        if (values.OF !== undefined) {
            this.OF = values.OF;
        }
    }

    /**
     * Sets the flags based on the value and the variant.
     *
     * This function will set the ZF, SF, and CF flags based on the value and the variant.
     * The OF flag will not be set.
     */
    public setFlagsFromValue(value: bigint, variant: (typeof SIZE_VARIANTS)[number]) {
        const shift = variantSignFlagShifts[variant];
        this.ZF = value === 0n ? 1n : 0n;
        this.SF = (value >> shift) & 1n;
        this.CF = (value >> (shift + 1n)) & 1n; // This is the carry flag
    }

    /**
     * Sets the overflow flag based on the values and the variant.
     */
    public setOverflowFlag(
        values: [bigint, bigint, bigint],
        variant: (typeof SIZE_VARIANTS)[number],
        isSubtraction: boolean = false,
    ) {
        const [a, b, result] = values;
        const shift = variantSignFlagShifts[variant];
        const signA = (a >> shift) & 1n;
        const signB = (b >> shift) & 1n;
        const signResult = (result >> shift) & 1n;

        if (isSubtraction) {
            this.OF = signA !== signB && signA !== signResult ? 1n : 0n;
        } else {
            this.OF = signA === signB && signA !== signResult ? 1n : 0n;
        }
    }

    public getFlags(): { ZF: bigint; SF: bigint; CF: bigint; OF: bigint } {
        return {
            ZF: this.ZF,
            SF: this.SF,
            CF: this.CF,
            OF: this.OF,
        };
    }

    public resetFlags() {
        this.ZF = 0n;
        this.SF = 0n;
        this.CF = 0n;
        this.OF = 0n;
    }
}

export default Flags;
