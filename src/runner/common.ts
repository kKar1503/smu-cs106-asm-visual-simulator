import { SIZE_VARIANTS } from "@/lexer/variant";

export const variantMask: Record<(typeof SIZE_VARIANTS)[number], bigint> = {
    B: 0xffn,
    W: 0xffffn,
    L: 0xffffffffn,
    Q: 0xffffffffffffffffn,
};

export const variantSignFlagShifts = {
    B: 7n,
    W: 15n,
    L: 31n,
    Q: 63n,
};
