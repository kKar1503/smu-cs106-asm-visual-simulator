export const BYTE_REGISTERS = ["AL", "BL", "CL", "DL", "SIL", "DIL", "BPL", "SPL"] as const;

export const WORD_REGISTERS = ["AX", "BX", "CX", "DX", "SI", "DI", "BP", "SP"] as const;

export const DWORD_REGISTERS = ["EAX", "EBX", "ECX", "EDX", "ESI", "EDI", "EBP", "ESP"] as const;

export const QWORD_REGISTERS = ["RAX", "RBX", "RCX", "RDX", "RSI", "RDI", "RBP", "RSP"] as const;

export function validateRegister(register: string, variant: string) {
    register = register.toUpperCase();
    switch (variant) {
        case "B":
            if (!BYTE_REGISTERS.includes(register as any)) {
                throw new Error(`Invalid register for variant ${variant}: ${register}`);
            }
            break;
        case "W":
            if (!WORD_REGISTERS.includes(register as any)) {
                throw new Error(`Invalid register for variant ${variant}: ${register}`);
            }
            break;
        case "D":
            if (!DWORD_REGISTERS.includes(register as any)) {
                throw new Error(`Invalid register for variant ${variant}: ${register}`);
            }
            break;
        case "Q":
            if (!QWORD_REGISTERS.includes(register as any)) {
                throw new Error(`Invalid register for variant ${variant}: ${register}`);
            }
            break;
        default:
            throw new Error(`Invalid variant: ${variant}`);
    }
}
