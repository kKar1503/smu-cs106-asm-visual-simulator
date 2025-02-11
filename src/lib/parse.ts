export function stringToBigInt(s: string): bigint {
    const valueToSet = BigInt(s);

    if (valueToSet < BigInt(0) || valueToSet > BigInt("0xffffffffffffffff")) {
        if (s.startsWith("0x")) {
            throw new Error("hex value out of range");
        } else {
            throw new Error("decimal value out of range");
        }
    }

    return valueToSet;
}
