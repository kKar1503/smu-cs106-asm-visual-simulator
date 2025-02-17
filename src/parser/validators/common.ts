import { BYTE_REGISTER_SET, DWORD_REGISTER_SET, QWORD_REGISTER_SET, WORD_REGISTER_SET } from "@/lexer/register";

export const variantRegisterSet: Record<string, Set<string>> = {
    B: BYTE_REGISTER_SET,
    W: WORD_REGISTER_SET,
    L: DWORD_REGISTER_SET,
    Q: QWORD_REGISTER_SET,
};

export const variantImmediateMaxSize: Record<string, bigint> = {
    B: 0xffn,
    W: 0xffffn,
    L: 0xffffffffn,
    Q: 0xffffffffn, // the only support for 64bit immediate is in the ABSQ variant
};
