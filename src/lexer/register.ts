export const BYTE_REGISTERS = ["AL", "BL", "CL", "DL", "SIL", "DIL", "BPL", "SPL"] as const;

export const WORD_REGISTERS = ["AX", "BX", "CX", "DX", "SI", "DI", "BP", "SP"] as const;

export const DWORD_REGISTERS = ["EAX", "EBX", "ECX", "EDX", "ESI", "EDI", "EBP", "ESP"] as const;

export const QWORD_REGISTERS = ["RAX", "RBX", "RCX", "RDX", "RSI", "RDI", "RBP", "RSP"] as const;

export const SUPPORTED_REGISTERS = [
    // BYTE
    ...BYTE_REGISTERS,
    // WORD
    ...WORD_REGISTERS,
    // DWORD
    ...DWORD_REGISTERS,
    // QWORD
    ...QWORD_REGISTERS,
] as const;

export const BYTE_REGISTER_SET = new Set(BYTE_REGISTERS);
export const WORD_REGISTER_SET = new Set(WORD_REGISTERS);
export const DWORD_REGISTER_SET = new Set(DWORD_REGISTERS);
export const QWORD_REGISTER_SET = new Set(QWORD_REGISTERS);

export const REGISTER_SET = new Set(SUPPORTED_REGISTERS);
