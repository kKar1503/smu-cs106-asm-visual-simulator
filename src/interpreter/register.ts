export const SUPPORTED_REGISTERS = [
    // BYTE
    "AL",
    "BL",
    "CL",
    "DL",
    "SIL",
    "DIL",
    "BPL",
    "SPL",
    // WORD
    "AX",
    "BX",
    "CX",
    "DX",
    "SI",
    "DI",
    "BP",
    "SP",
    // DWORD
    "EAX",
    "EBX",
    "ECX",
    "EDX",
    "ESI",
    "EDI",
    "EBP",
    "ESP",
    // QWORD
    "RAX",
    "RBX",
    "RCX",
    "RDX",
    "RSI",
    "RDI",
    "RBP",
    "RSP",
] as const;

export const REGISTERS = new Set(SUPPORTED_REGISTERS);
