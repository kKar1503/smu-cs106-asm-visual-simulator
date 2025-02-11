export type Action =
    | {
          type: "In"; // Into ALU
          source: string; // Register or memory
          sourceType: "Register" | "Memory";
      }
    | {
          type: "Out"; // From ALU
          destination: string; // Register or memory
          destinationType: "Register" | "Memory";
      }
    | {
          type: "Operation"; // Operation
          operation: (...arr: bigint[]) => bigint;
      };
