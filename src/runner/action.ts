import { SIZE_VARIANTS } from "@/lexer/variant";

type MovementType = "Register" | "Memory" | "CPU";
type MovementReference = "CPU" | `%${string}` | bigint;
type SetValue =
    | {
          type: "Register";
          reference: `%${string}`;
          variant: (typeof SIZE_VARIANTS)[number];
          value: bigint;
      }
    | {
          type: "Memory";
          reference: bigint;
          variant: (typeof SIZE_VARIANTS)[number];
          value: bigint;
      }
    | {
          type: "CPU";
          value: {
              src?: bigint;
              dst?: bigint;
          };
      }
    | {
          type: "Flags";
          value: {
              ZF?: number;
              SF?: number;
              CF?: number;
              OF?: number;
          };
      };

export type Action =
    | {
          type: "Move";
          source: MovementReference; // Register name or memory address or "CPU"
          sourceType: MovementType;
          destination: MovementReference; // Register name or memory address or "CPU"
          destinationType: MovementType;
      }
    | {
          type: "Set"; // Operation
          set: SetValue;
      };
