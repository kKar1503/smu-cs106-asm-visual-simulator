export const SIZE_VARIANTS = ["B", "W", "L", "Q"] as const;

export const ZERO_EXTENSION_VARIANTS = ["ZBW", "ZBL", "ZBQ", "ZWL", "ZWQ"] as const;

export const SIGNED_EXTENSION_VARIANTS = ["SBW", "SBL", "SBQ", "SWL", "SWQ", "SLQ"] as const;

export const MOV_VARIANTS = [
    // Immediate to Register
    "ABSQ",
    // Zero Extensions
    ...ZERO_EXTENSION_VARIANTS,
    // Signed Extensions
    ...SIGNED_EXTENSION_VARIANTS,
] as const;

export const SUPPORTED_VARIANTS = [
    ...SIZE_VARIANTS,
    // MOV specifics
    ...MOV_VARIANTS,
] as const;

export const VARIANTS = new Set(SUPPORTED_VARIANTS);
