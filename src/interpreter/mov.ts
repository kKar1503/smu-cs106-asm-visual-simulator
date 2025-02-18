import { stringToBigInt } from "@/lib/parse";
import { Action } from "./action";
import { validateRegister } from "./registers";
import { valueType } from "./utils";

export default class MovInterpreter {
    private line: string;

    constructor(line: string) {
        this.line = line;
    }

    public interprete(): [interpreter: string, actions: Action[]] {
        const parts = this.line.split(" ");

        if (parts.length < 3) {
            throw new Error(`Insufficient arguments for MOV: ${this.line}`);
        }

        const [instruction, src, dst] = parts;
        const variant = instruction.toUpperCase().replace("MOV", "").trim();
        console.log(variant, src, dst);
        switch (variant.length) {
            case 1:
                return this.variantNoExtension(src, dst, variant);
            case 3:
                if (variant[0] === "S") {
                    return this.variantSignedExtension(src, dst, variant);
                } else if (variant[0] === "Z") {
                    return this.variantZeroExtension(src, dst, variant);
                }
            case 4:
                return this.variantABSQ(src, dst);
        }

        throw new Error(`Unsupported variant for MOV: ${variant}`);
    }

    private variantABSQ(src: string, dst: string): [interpreter: string, actions: Action[]] {
        const srcType = valueType(src);
        const dstType = valueType(dst);

        if (srcType !== "IMMEDIATE") {
            throw new Error(`Invalid source for variant ABSQ: ${src}`);
        }

        if (dstType !== "REGISTER") {
            throw new Error(`Invalid destination for variant ABSQ: ${dst}`);
        }

        const dstWithoutPercent = dst.slice(1); // remove the leading % sign
        validateRegister(dstWithoutPercent, "Q");

        const actions: Action[] = [];
        const srcValue = src.slice(1);
        if (srcValue.startsWith("0x")) {
            actions.push({
                type: "Operation",
                operation: () => stringToBigInt(srcValue),
            });
        } else {
            actions.push({
                type: "Operation",
                operation: () => stringToBigInt(srcValue.replaceAll(",", "")),
            });
        }

        actions.push({
            type: "Out",
            destination: dstWithoutPercent,
            destinationType: "Register",
        });

        return [`Move immediate (${src}) to register (${dst})`, actions];
    }

    private variantNoExtension(src: string, dst: string, variant: string): [interpreter: string, actions: Action[]] {
        const srcType = valueType(src);
        const dstType = valueType(dst);

        if (srcType === "IMMEDIATE") {
            throw new Error(`Invalid source for variant ABSQ: ${src}`);
        }

        if (dstType === "IMMEDIATE") {
            throw new Error(`Invalid destination for variant ABSQ: ${dst}`);
        }

        if (srcType === "MEMORY" && dstType === "MEMORY") {
            throw new Error(`Cannot MOV from memory ${src} to memory ${dst}`);
        }

        if (dstType === "REGISTER" && srcType === "REGISTER") {
            // Move register to register
            const dstWithoutPercent = dst.slice(1); // remove the leading % sign
            validateRegister(dstWithoutPercent, "Q");
            const srcWithoutPercent = src.slice(1); // remove the leading % sign
            validateRegister(srcWithoutPercent, "Q");

            const actions: Action[] = [];
            actions.push({
                type: "In",
                source: srcWithoutPercent,
                sourceType: "Register",
            });

            actions.push({
                type: "Operation",
                operation: (_, srcValue) => srcValue,
            });

            actions.push({
                type: "Out",
                destination: dstWithoutPercent,
                destinationType: "Register",
            });
            return [`Move register (${src}) to register (${dst})`, actions];
        } else if (dstType === "REGISTER" && srcType === "MEMORY") {
            //
        } else if (dstType === "MEMORY" && srcType === "REGISTER") {
        }

        return ["", []];
    }

    private variantSignedExtension(src: string, dst: string, variant: string): [interpreter: string, actions: Action[]] {
        return ["", []];
    }

    private variantZeroExtension(src: string, dst: string, variant: string): [interpreter: string, actions: Action[]] {
        return ["", []];
    }
}
