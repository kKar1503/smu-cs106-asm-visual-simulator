export const SUPPORTED_INSTRUCTIONS = [
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

export const INSTRUCTIONS = new Set(SUPPORTED_INSTRUCTIONS);
