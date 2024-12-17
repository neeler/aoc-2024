import { Puzzle } from './Puzzle';
import { parseNumberList, splitFilter } from '~/util/parsing';
import { mod } from '~/util/arithmetic';
import { range } from '~/util/range';

interface ComputerInput {
    regA: number;
    regB: number;
    regC: number;
    instructions: number[];
}

class Computer {
    regA: number;
    regB: number;
    regC: number;
    outputValues: number[] = [];
    instructions: number[] = [];
    iInstruction = 0;

    constructor({ regA, regB, regC, instructions }: ComputerInput) {
        this.regA = regA;
        this.regB = regB;
        this.regC = regC;
        this.instructions = instructions;
    }

    run() {
        while (this.runOnce()) {}
        return this;
    }

    outputOnce() {
        while (this.outputValues.length < 1 && this.runOnce()) {}
        return this.outputValues[0]!;
    }

    private runOnce(): boolean {
        const instruction = this.instructions[this.iInstruction];
        const operand = this.instructions[this.iInstruction + 1];

        if (instruction === undefined || operand === undefined) {
            return false;
        }

        const shouldIncrement = this.operate(instruction, operand);
        if (shouldIncrement) this.iInstruction += 2;

        return true;
    }

    private combo(val: number) {
        if (val <= 3) return val;
        switch (val) {
            case 4:
                return this.regA;
            case 5:
                return this.regB;
            case 6:
                return this.regC;
            default:
                throw new Error(`Invalid combo operand: ${val}`);
        }
    }

    private divide(operand: number) {
        return Math.floor(this.regA / 2 ** this.combo(operand));
    }

    private operate(instruction: number, operand: number): boolean {
        switch (instruction) {
            case 0: // adv
                this.regA = this.divide(operand);
                break;
            case 1: // bxl
                this.regB = this.regB ^ operand;
                break;
            case 2: // bst
                this.regB = mod(this.combo(operand), 8);
                break;
            case 3: // jnz
                if (this.regA !== 0) {
                    this.iInstruction = operand;
                    return false;
                }
                break;
            case 4: // bxc
                this.regB = this.regB ^ this.regC;
                break;
            case 5: // out
                this.outputValues.push(mod(this.combo(operand), 8));
                break;
            case 6: // bdv
                this.regB = this.divide(operand);
                break;
            case 7: // cdv
                this.regC = this.divide(operand);
                break;
            default:
                throw new Error(`Invalid instruction: ${instruction}`);
        }

        return true;
    }

    output(delimiter = ',') {
        return this.outputValues.join(delimiter);
    }
}

export const puzzle17 = new Puzzle({
    day: 17,
    parseInput: (fileData) => {
        const [regA = '', regB = '', regC = '', program = ''] =
            splitFilter(fileData);
        return {
            regA: Number(regA.slice(12)),
            regB: Number(regB.slice(12)),
            regC: Number(regC.slice(12)),
            instructions: parseNumberList(program.slice(9)),
        };
    },
    part1: (data) => {
        runTestCases();

        const computer = new Computer(data);
        computer.run();
        return computer.output();
    },
    part2: ({ instructions }) => {
        let answers: number[] = [0];

        for (const target of instructions.toReversed().map(Number)) {
            const nextAnswers: number[] = [];
            for (const previousAnswer of answers) {
                for (const c of range(0, 8)) {
                    const candidate = previousAnswer * 8 + c;
                    const computer = new Computer({
                        regA: candidate,
                        regB: 0,
                        regC: 0,
                        instructions: instructions,
                    });
                    if (computer.outputOnce() === target) {
                        nextAnswers.push(candidate);
                    }
                }
            }
            answers = nextAnswers;
        }

        return Math.min(...answers.map(Number));
    },
});

function runTestCases() {
    const testCases: {
        input: ComputerInput;
        expectedOutput?: string;
        expectedA?: number;
        expectedB?: number;
        expectedC?: number;
    }[] = [
        {
            input: {
                regA: 0,
                regB: 0,
                regC: 9,
                instructions: [2, 6],
            },
            expectedB: 1,
        },
        {
            input: {
                regA: 10,
                regB: 0,
                regC: 0,
                instructions: [5, 0, 5, 1, 5, 4],
            },
            expectedOutput: '0,1,2',
        },
        {
            input: {
                regA: 2024,
                regB: 0,
                regC: 0,
                instructions: [0, 1, 5, 4, 3, 0],
            },
            expectedOutput: '4,2,5,6,7,7,7,7,3,1,0',
            expectedA: 0,
        },
        {
            input: {
                regA: 0,
                regB: 29,
                regC: 0,
                instructions: [1, 7],
            },
            expectedB: 26,
        },
        {
            input: {
                regA: 0,
                regB: 2024,
                regC: 43690,
                instructions: [4, 0],
            },
            expectedB: 44354,
        },
    ];

    for (const testCase of testCases) {
        const computer = new Computer(testCase.input);
        computer.run();
        if (testCase.expectedOutput !== undefined) {
            if (computer.output() !== testCase.expectedOutput) {
                throw new Error('Mismatched output');
            }
        }
        if (testCase.expectedA !== undefined) {
            if (computer.regA !== testCase.expectedA) {
                throw new Error('Mismatched A');
            }
        }
        if (testCase.expectedB !== undefined) {
            if (computer.regB !== testCase.expectedB) {
                throw new Error('Mismatched B');
            }
        }
        if (testCase.expectedC !== undefined) {
            if (computer.regC !== testCase.expectedC) {
                throw new Error('Mismatched C');
            }
        }
    }
}
