export function valueType(value) {
    if (value.startsWith("$")) {
        return "IMMEDIATE";
    } else if (value.startsWith("%")) {
        return "REGISTER";
    } else {
        return "MEMORY";
    }
}
