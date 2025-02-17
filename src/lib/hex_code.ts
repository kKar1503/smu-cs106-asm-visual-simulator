export default function hex(num: number | bigint | string, size: number = 4): string {
    if (typeof num === "string" && num.startsWith("0x")) {
        return num;
    }

    if (typeof num !== "bigint") {
        num = BigInt(num); // TODO: lazy to check if it's a valid number
    }

    return "0x" + num.toString(16).padStart(size, "0");
}
