export const SUPPORTED_INSTRUCTIONS = [
    // Data Movement
    "MOV",
    // Load Effective Address
    "LEA",
    // Unary Operations
    "INC",
    "DEC",
    "NEG",
    "NOT",
    // Binary Operations
    "ADD",
    "SUB",
    "AND",
    "OR",
    "XOR",
    "SAL",
    "SAR", // Arithmetic Shift Right
    "SHR", // Logical Shift Right
] as const;
