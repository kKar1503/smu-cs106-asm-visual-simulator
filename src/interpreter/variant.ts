export const SUPPORTED_VARIANTS = [
    "B",
    "W",
    "L",
    "Q",
    // MOV specifics
    // Immediate to Register
    "ABSQ",
    // Zero Extensions
    "ZBW",
    "ZBL",
    "ZBQ",
    "ZWL",
    "ZWQ",
    // Signed Extensions
    "SBW",
    "SBL",
    "SBQ",
    "SWL",
    "SWQ",
    "SLQ",
] as const;

export const VARIANTS = new Set(SUPPORTED_VARIANTS);
