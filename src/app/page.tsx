"use client";

import * as React from "react";
import { motion } from "motion/react";
import * as TextArea from "@/components/ui/textarea";
import * as Button from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import hex from "@/lib/hex_code";
import { useToast } from "@/hooks/use-toast";
import { stringToBigInt } from "@/lib/parse";
import AssmeblyInterpreter from "@/interpreter/assembly";
import { QWORD_REGISTERS } from "@/interpreter/registers";
import { Action } from "@/interpreter/action";
import Lexer from "@/lexer/lexer";
import Parser from "@/parser/parser";
import { AssemblyNode } from "@/parser/common";

const RAM_SIZE = 64;

type Registers = {
    [k in (typeof QWORD_REGISTERS)[number]]: bigint;
};
type Ram = Record<string, bigint>;

const AssemblySimulator = () => {
    const [code, setCode] = React.useState("");
    const [registers, setRegisters] = React.useState<Registers>({} as any);
    const [memory, setMemory] = React.useState<Ram>({});
    const [executing, setExecuting] = React.useState(false);
    const [editting, setEditing] = React.useState("");
    const [edittingValue, setEditingValue] = React.useState("");
    const [edittingReg, setEditingReg] = React.useState("");
    const [edittingRegValue, setEditingRegValue] = React.useState("");
    const [alu, setAlu] = React.useState<bigint>(BigInt(0));
    const [aluTemp, setAluTemp] = React.useState<bigint>(BigInt(0));
    const [currentInstruction, setCurrentInstruction] = React.useState("");
    const [currentInterpreterMessage, setCurrentInterpreterMessage] = React.useState<string[]>([]);
    const [actions, setActions] = React.useState<Action[]>([]);
    const [instructions, setInstructions] = React.useState<[instruction: string, interpreter: string, actions: Action[]][]>([]);
    const [actionDuration, setActionDuration] = React.useState(1000);
    const [glow, setGlow] = React.useState(false);
    const registerRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
    const aluRef = React.useRef<HTMLDivElement>(null);
    const [movingDiv, setMovingDiv] = React.useState<{
        startLeft: number;
        startTop: number;
        startWidth: number;
        startHeight: number;
        endLeft: number;
        endTop: number;
        endWidth: number;
        endHeight: number;
        title: string;
        value: string;
    } | null>(null);
    const { toast } = useToast();

    React.useEffect(() => {
        const _ram: Ram = {};
        for (let i = 0; i < RAM_SIZE; i++) {
            _ram[i] = BigInt(0);
        }
        setMemory(_ram);

        const _registers: Registers = {} as any;
        for (const reg of QWORD_REGISTERS) {
            _registers[reg] = BigInt(0);
        }
        setRegisters(_registers);
    }, []);

    const renderWithLexer = (code: string) => {
        const lexer = new Lexer(code);
        const tokens = lexer.tokenise();
        console.log("Tokens:");
        console.dir(tokens, { depth: null });
        const nodes: AssemblyNode[] = [];
        const parser = new Parser(tokens);
        let line = parser.parseLine();
        while (line !== null) {
            nodes.push(line);
            line = parser.parseLine();
        }

        console.log("Nodes:");
        console.dir(nodes, { depth: null });
    };

    const updateRam = (address: string, value: string) => {
        let valueToSet = BigInt(0);
        try {
            valueToSet = stringToBigInt(value);
        } catch (err) {
            console.log("failed to parse value", err);
            toast({
                title: "Invalid decimal or hexadecimal value",
                description: "Please enter a valid decimal or hexadecimal value",
                variant: "destructive",
            });
        } finally {
            setMemory({ ...memory, [address]: valueToSet });
            setEditing("");
            setEditingValue("");
        }
    };

    const updateReg = (address: string, value: string) => {
        let valueToSet = BigInt(0);
        try {
            valueToSet = stringToBigInt(value);
        } catch (err) {
            console.log("failed to parse value", err);
            toast({
                title: "Invalid decimal or hexadecimal value",
                description: "Please enter a valid decimal or hexadecimal value",
                variant: "destructive",
            });
        } finally {
            setRegisters({ ...registers, [address]: valueToSet });
            setEditingReg("");
            setEditingRegValue("");
        }
    };

    const clickEditting = (address: string, value: string) => {
        setEditingReg("");
        setEditingRegValue("");
        setEditing(address);
        setEditingValue(value);
    };

    const clickEdittingReg = (address: string, value: string) => {
        setEditing("");
        setEditingValue("");
        setEditingReg(address);
        setEditingRegValue(value);
    };

    React.useEffect(() => {
        if (!executing) {
            return;
        }

        if (actions.length !== 0) {
            return;
        }

        if (instructions.length === 0) {
            setExecuting(false);
            return;
        }

        setCurrentInstruction(instructions[0][0]);
        setCurrentInterpreterMessage([...currentInterpreterMessage, instructions[0][1]]);
        setActions(instructions[0][2]);
    }, [instructions]);

    React.useEffect(() => {
        if (!executing) {
            return;
        }

        if (actions.length === 0) {
            setInstructions(instructions.slice(1));
            return;
        }

        const action = actions[0];
        console.log(action);
        switch (action.type) {
            case "Operation":
                setAlu(action.operation(alu, aluTemp));
                triggerGlow();
                break;
            case "Out":
                if (action.destinationType === "Register") {
                    move(action.destination.toUpperCase(), hex(alu, 16), "OUT", "REGISTER", () => {
                        setRegisters({ ...registers, [action.destination.toUpperCase()]: alu });
                    });
                } else if (action.destinationType === "Memory") {
                    move(action.destination.toUpperCase(), hex(alu, 16), "OUT", "MEMORY", () => {
                        setMemory({ ...memory, [action.destination]: alu });
                    });
                }
                break;
            case "In":
                if (action.sourceType === "Register") {
                    move(
                        action.source.toUpperCase(),
                        hex(registers[action.source.toUpperCase() as keyof Registers], 16),
                        "IN",
                        "REGISTER",
                        () => {
                            setAluTemp(registers[action.source.toUpperCase() as keyof Registers]);
                        },
                    );
                } else if (action.sourceType === "Memory") {
                    move(action.source.toUpperCase(), hex(memory[action.source], 2), "IN", "MEMORY", () => {
                        setAluTemp(memory[action.source]);
                    });
                }
                break;
        }

        setTimeout(() => {
            setActions(actions.slice(1));
        }, actionDuration);
    }, [actions]);

    const move = (address: string, value: string, direction: "IN" | "OUT", type: "REGISTER" | "MEMORY", cb: () => void) => {
        let el: HTMLDivElement | null;
        if (type === "REGISTER") {
            el = registerRefs.current[address];
        } else {
            el = registerRefs.current[address];
        }

        if (!el) return;

        // Get the start and target positions
        let startRect: DOMRect | undefined;
        let endRect: DOMRect | undefined;
        if (direction === "IN") {
            startRect = el.getBoundingClientRect();
            endRect = aluRef.current?.getBoundingClientRect();
        } else {
            startRect = aluRef.current?.getBoundingClientRect();
            endRect = el.getBoundingClientRect();
        }

        if (!startRect || !endRect) return;

        // Set the moving div with animation
        setMovingDiv({
            startLeft: startRect.left,
            startTop: startRect.top,
            startWidth: startRect.width,
            startHeight: startRect.height,
            endLeft: endRect.left,
            endTop: endRect.top,
            endWidth: endRect.width,
            endHeight: endRect.height,
            title: direction === "OUT" ? "ALU" : address,
            value: hex(type === "REGISTER" ? registers[address as keyof Registers] : memory[address], 16),
        });

        // Remove after animation
        setTimeout(() => {
            setMovingDiv(null);
            cb();
        }, 1000);
    };

    React.useEffect(() => {
        console.log({ movingDiv, aluRef: aluRef.current?.getBoundingClientRect() });
    }, [movingDiv]);

    const execute = () => {
        renderWithLexer(code);
        const interpreter = new AssmeblyInterpreter(code);
        const instructions: [string, string, Action[]][] = [];
        try {
            while (interpreter.hasNext()) {
                const instruction = interpreter.getCurrentActions();
                instructions.push(instruction);
            }
            setInstructions(instructions);
            setExecuting(true);
        } catch (err: unknown) {
            console.log(err);
            toast({
                title: "Error",
                description: (err as Error)?.message ?? "An error occurred",
                variant: "destructive",
            });
        }
    };

    const triggerGlow = () => {
        setGlow(true);
        setTimeout(() => setGlow(false), actionDuration / 2);
    };

    return (
        <>
            <div className="p-4 flex flex-row h-screen gap-4">
                <div className="flex flex-col gap-4 min-w-52">
                    <h2 className="text-xl font-bold">Assembly Input</h2>
                    <TextArea.Textarea
                        className="flex-grow resize-none"
                        placeholder="Enter assembly code..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <Button.Button disabled className="">
                        🧹 Format (WIP) 🧹
                    </Button.Button>
                    <Button.Button onClick={execute} className="">
                        {executing ? "🛑 Stop 🛑" : "⚡️ Execute ⚡️"}
                    </Button.Button>
                </div>
                <div id="computer" className="p-2 border-solid border-2 border-zinc-200 rounded-xl w-full flex gap-2">
                    <div className="flex flex-col gap-2 h-full min-w-64">
                        <motion.div
                            id="cpu"
                            className="flex flex-col gap-2 border-solid border-2 border-zinc-200 rounded-xl p-2 h-max"
                            animate={{
                                boxShadow: glow ? "0px 0px 20px rgba(0, 0, 255, 0.5)" : "0px 0px 0px rgba(0, 0, 255, 0)",
                            }}
                            transition={{ duration: actionDuration / 4 / 1000, ease: "easeInOut" }}
                        >
                            <h2 className="text-xl font-bold">CPU</h2>
                            <Card.Card className="text-center" ref={aluRef}>
                                <Card.CardHeader>
                                    <Card.CardTitle>
                                        <strong>ALU</strong>
                                    </Card.CardTitle>
                                </Card.CardHeader>
                                <Card.CardContent>{hex(alu, 16)}</Card.CardContent>
                            </Card.Card>
                        </motion.div>
                        <div
                            id="instruction"
                            className="flex flex-col gap-2 border-solid border-2 border-zinc-200 rounded-xl p-2"
                        >
                            <h2 className="text-xl font-bold">Current Instruction</h2>
                            <TextArea.Textarea className="flex-grow resize-none" value={currentInstruction} readOnly />
                        </div>
                        <div
                            id="interpreter"
                            className="flex flex-col gap-2 border-solid border-2 border-zinc-200 rounded-xl p-2 h-full"
                        >
                            <h2 className="text-xl font-bold">Interpreter</h2>
                            <TextArea.Textarea
                                className="flex-grow resize-none"
                                placeholder={currentInterpreterMessage.join("\n")}
                                readOnly
                            />
                        </div>
                    </div>
                    <div
                        id="registers"
                        className="flex flex-col gap-2 min-w-64 border-solid border-2 border-zinc-200 rounded-xl p-2 h-full"
                    >
                        <h2 className="text-xl font-bold">Registers</h2>
                        {Object.entries(registers).map(([reg, value]) => (
                            <Card.Card
                                key={reg}
                                className="text-center cursor-pointer"
                                onClick={() => clickEdittingReg(reg, hex(value, 16))}
                                ref={(el) => {
                                    registerRefs.current[reg] = el;
                                }}
                            >
                                <Card.CardHeader>
                                    <Card.CardTitle>
                                        <strong>{reg}</strong>
                                    </Card.CardTitle>
                                </Card.CardHeader>
                                <Card.CardContent>
                                    {edittingReg === reg ? (
                                        <Input
                                            autoFocus
                                            value={edittingRegValue}
                                            className="p-2"
                                            onChange={(e) => setEditingRegValue(e.target.value)}
                                            onBlur={() => updateReg(reg, edittingRegValue)}
                                        />
                                    ) : (
                                        hex(value, 16)
                                    )}
                                </Card.CardContent>
                            </Card.Card>
                        ))}
                    </div>
                    <div
                        id="ram"
                        className="flex flex-col gap-2 border-solid border-2 border-zinc-200 rounded-xl p-2 h-full w-full"
                    >
                        <h2 className="text-xl font-bold">RAM</h2>
                        <div className="flex flex-wrap gap-4">
                            {Object.entries(memory).map(([address, value]) => (
                                <Card.Card
                                    key={address}
                                    className="text-center w-24 h-24 cursor-pointer"
                                    onClick={() => clickEditting(address, hex(value, 2))}
                                >
                                    <Card.CardHeader>
                                        <Card.CardTitle>
                                            <strong>{hex(address)}</strong>
                                        </Card.CardTitle>
                                    </Card.CardHeader>
                                    <Card.CardContent>
                                        {editting === address ? (
                                            <Input
                                                autoFocus
                                                value={edittingValue}
                                                className="p-2"
                                                onChange={(e) => setEditingValue(e.target.value)}
                                                onBlur={() => updateRam(address, edittingValue)}
                                            />
                                        ) : (
                                            hex(value, 2)
                                        )}
                                    </Card.CardContent>
                                </Card.Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {movingDiv && (
                <motion.div
                    initial={{
                        left: movingDiv.startLeft,
                        top: movingDiv.startTop,
                        width: movingDiv.startWidth,
                        height: movingDiv.startHeight,
                        position: "absolute",
                    }}
                    animate={{
                        left: movingDiv.endLeft,
                        top: movingDiv.endTop,
                        width: movingDiv.endWidth,
                        height: movingDiv.endHeight,
                        position: "absolute",
                    }}
                    transition={{ duration: actionDuration / 1000, ease: "easeInOut" }}
                >
                    <Card.Card className="text-center bg-blue-200/50 border-solid border-2 border-blue-500 rounded-xl">
                        <Card.CardHeader>
                            <Card.CardTitle>
                                <strong className="text-ellipsis">{movingDiv.title}</strong>
                            </Card.CardTitle>
                        </Card.CardHeader>
                        <Card.CardContent className="text-ellipsis">{movingDiv.value}</Card.CardContent>
                    </Card.Card>
                </motion.div>
            )}
        </>
    );
};

export default AssemblySimulator;
