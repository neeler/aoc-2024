import { Puzzle } from './Puzzle';
import { getNumbers, splitFilter } from '~/util/parsing';
import { CustomSet } from '~/types/CustomSet';
import { Queue } from '~/types/Queue';

class Wire {
    id: string;
    value: boolean | undefined;

    constructor({ id, initialValue }: { id: string; initialValue?: boolean }) {
        this.id = id;
        this.value = initialValue;
    }
}

class WireSet extends CustomSet<Wire> {
    constructor() {
        super({
            getKey: (w) => w.id,
        });
    }
}

type GateType = 'AND' | 'OR' | 'XOR';

class Gate {
    input1: Wire;
    input2: Wire;
    output: Wire;
    type: GateType;
    latched = false;

    constructor({
        input1,
        input2,
        output,
        type,
    }: {
        input1: Wire;
        input2: Wire;
        output: Wire;
        type: GateType;
    }) {
        this.input1 = input1;
        this.input2 = input2;
        this.output = output;
        this.type = type;
    }

    get id() {
        return this.output.id;
    }

    try() {
        if (
            this.input1.value === undefined ||
            this.input2.value === undefined
        ) {
            this.latched = false;
            return;
        }
        switch (this.type) {
            case 'AND':
                this.output.value = this.input1.value && this.input2.value;
                break;
            case 'OR':
                this.output.value = this.input1.value || this.input2.value;
                break;
            case 'XOR':
                this.output.value = this.input1.value !== this.input2.value;
                break;
        }
        this.latched = true;
    }

    reset() {
        this.latched = false;
        this.output.value = undefined;
    }
}

type GatePair = [Gate, Gate];

export const puzzle24 = new Puzzle({
    day: 24,
    parseInput: (fileData, { example }) => {
        const [wireStrings = [], gateStrings = []] = splitFilter(
            fileData,
            '\n\n',
        ).map((s) => splitFilter(s));
        const wireArray = wireStrings.map((s) => {
            const [id, value] = s.split(': ') as [string, string];
            return new Wire({ id, initialValue: value === '1' });
        });
        const wires = new WireSet();
        wireArray.forEach((w) => wires.add(w));
        const gates = new Set<Gate>();
        gateStrings.forEach((def) => {
            const [, input1, type, input2, output] = def.match(
                /(\w+) (\w+) (\w+) -> (\w+)/,
            ) as [string, string, string, string, string];
            const wire1 = wires.get(input1) ?? new Wire({ id: input1 });
            const wire2 = wires.get(input2) ?? new Wire({ id: input2 });
            const outputWire = wires.get(output) ?? new Wire({ id: output });
            wires.add(wire1);
            wires.add(wire2);
            wires.add(outputWire);
            const gate = new Gate({
                input1: wire1,
                input2: wire2,
                output: outputWire,
                type: type as GateType,
            });
            gates.add(gate);
        });
        return {
            wires,
            gates,
            isExample: !!example,
        };
    },
    part1: ({ wires, gates }) => {
        runCircuit(gates);
        return getValueForWireSet(wires, 'z');
    },
    skipPart1: true,
    part2: ({ wires, gates, isExample }) => {
        if (isExample) {
            const xValue = getValueForWireSet(wires, 'x');
            const yValue = getValueForWireSet(wires, 'y');
            const correctZValue = xValue & yValue;
            const gatePairs = getGatePairs(gates);

            for (const pair1 of gatePairs) {
                swapGateOutputs(pair1);
                const gatesSeen1 = new Set<Gate>(pair1);
                const remainingPairs1 = gatePairs.filter(
                    (p) => !p.some((g) => gatesSeen1.has(g)),
                );

                for (const pair2 of remainingPairs1) {
                    swapGateOutputs(pair2);

                    runCircuit(gates);
                    const zValue = getValueForWireSet(wires, 'z');
                    if (zValue === correctZValue) {
                        return getComboString([pair1, pair2]);
                    }

                    swapGateOutputs(pair2);
                }

                swapGateOutputs(pair1);
            }

            throw new Error('No solution found');
        }

        const getInputGate = (level: number, type: GateType) => {
            const xId = `x${level.toString().padStart(2, '0')}`;
            return gateArray.find(
                (g) =>
                    g.type === type &&
                    (g.input1.id === xId || g.input2.id === xId),
            )!;
        };

        const getGateWithInput = (inputWire: Wire, type: GateType | 'ANY') => {
            return gateArray.find(
                (g) =>
                    (g.type === type || type === 'ANY') &&
                    (g.input1 === inputWire || g.input2 === inputWire),
            );
        };

        const getGateWithOutput = (
            outputWire: Wire,
            type: GateType | 'ANY',
        ) => {
            return gateArray.find(
                (g) =>
                    (g.type === type || type === 'ANY') &&
                    g.output === outputWire,
            );
        };

        const problemGates = new Set<Gate>();

        const gateArray = Array.from(gates);

        const swappedPairs: GatePair[] = [];

        const xorGate0 = getInputGate(0, 'XOR');
        if (xorGate0.output.id !== 'z00') {
            problemGates.add(xorGate0);
        }
        const andGate0 = getInputGate(0, 'AND');

        let carryGate = andGate0;
        let carryWire = andGate0.output;

        for (let level = 1; level < 45; level++) {
            const xorGate = getInputGate(level, 'XOR');
            const andGate = getInputGate(level, 'AND');
            let carryXORGate = getGateWithInput(carryWire, 'XOR');
            if (
                carryXORGate &&
                carryXORGate.output.id !==
                    `z${level.toString().padStart(2, '0')}`
            ) {
                const gateToSwap = getGateWithOutput(
                    wires.get(`z${level.toString().padStart(2, '0')}`)!,
                    'ANY',
                )!;
                swapGateOutputs([carryXORGate, gateToSwap]);
                swappedPairs.push([carryXORGate, gateToSwap]);
                carryXORGate = getGateWithInput(carryWire, 'XOR');
                carryWire = carryGate.output;
            }
            if (!carryXORGate) {
                console.log('no carryXORGate', carryWire.id);
                break;
            }
            if (
                carryXORGate.input1 !== xorGate.output &&
                carryXORGate.input2 !== xorGate.output
            ) {
                const inputNotCarryWire = [
                    carryXORGate.input1,
                    carryXORGate.input2,
                ].find((w) => w !== carryWire)!;
                const gateToSwap = getGateWithOutput(inputNotCarryWire, 'ANY')!;
                swapGateOutputs([xorGate, gateToSwap]);
                swappedPairs.push([xorGate, gateToSwap]);
            }
            let carryANDGate = getGateWithInput(carryWire, 'AND');
            if (!carryANDGate) {
                console.log('problem with carryANDGate', { carryANDGate });
                problemGates.add(carryGate);
                carryANDGate = getGateWithInput(xorGate.output, 'AND')!;
                break;
            }
            if (
                !problemGates.has(xorGate) &&
                !problemGates.has(carryANDGate) &&
                carryANDGate.input1 !== xorGate.output &&
                carryANDGate.input2 !== xorGate.output
            ) {
                console.log('problem with carryANDGate', {
                    carryANDGate,
                    xorGate,
                });
                problemGates.add(xorGate);
            }
            const carryANDORGate = getGateWithInput(carryANDGate.output, 'OR');
            const inputANDORGate = getGateWithInput(andGate.output, 'OR');
            if (!carryANDORGate) {
                console.log('missing carryANDORGate');
                problemGates.add(carryANDGate);
                break;
            }
            if (!inputANDORGate) {
                console.log('missing inputANDORGate');
                problemGates.add(andGate);
                break;
            }
            if (carryANDORGate && carryANDORGate === inputANDORGate) {
                carryWire = carryANDORGate!.output;
                carryGate = carryANDORGate;
            }
        }

        if (swappedPairs.length !== 4) {
            throw new Error(`Invalid swap count: ${swappedPairs.length}`);
        }

        const xValue = getValueForWireSet(wires, 'x');
        const yValue = getValueForWireSet(wires, 'y');
        const correctZValue = xValue + yValue;

        runCircuit(gates);

        const zValue = getValueForWireSet(wires, 'z');
        if (zValue !== correctZValue) {
            throw new Error(`Invalid swaps! Incorrect z value: ${zValue}`);
        }

        return getComboString(swappedPairs);
    },
});

function getComboString(combo: GatePair[]) {
    return combo
        .flat()
        .map((g) => g.output.id)
        .sort()
        .join(',');
}

function swapGateOutputs([gate1, gate2]: GatePair) {
    const output1 = gate1.output;
    gate1.output = gate2.output;
    gate2.output = output1;
}

function getGatePairs(gates: Set<Gate>) {
    const gatePairs: GatePair[] = [];
    const pairsSeen = new Set<string>();
    for (const gate1 of gates) {
        for (const gate2 of gates) {
            if (gate1 === gate2) {
                continue;
            }
            const key = [gate1.output.id, gate2.output.id].sort().join(',');
            if (pairsSeen.has(key)) {
                continue;
            }
            pairsSeen.add(key);
            gatePairs.push([gate1, gate2]);
        }
    }
    return gatePairs;
}

function runCircuit(gates: Set<Gate>) {
    const gatesByInputWire = new Map<string, Gate[]>();
    for (const gate of gates) {
        if (!gatesByInputWire.has(gate.input1.id)) {
            gatesByInputWire.set(gate.input1.id, []);
        }
        if (!gatesByInputWire.has(gate.input2.id)) {
            gatesByInputWire.set(gate.input2.id, []);
        }
        gatesByInputWire.get(gate.input1.id)!.push(gate);
        gatesByInputWire.get(gate.input2.id)!.push(gate);
    }
    const gatesSeen = new Set<Gate>();
    const queue = new Queue<Gate>();
    for (const gate of gates) {
        if (
            gate.input1.value !== undefined &&
            gate.input2.value !== undefined
        ) {
            queue.add(gate);
        }
    }
    queue.process((gate) => {
        gate.try();
        if (!gate.latched) {
            queue.add(gate);
            return;
        }
        gatesSeen.add(gate);
        for (const childGate of gatesByInputWire.get(gate.output.id) ?? []) {
            if (!gatesSeen.has(childGate)) {
                queue.add(childGate);
            }
        }
    });
}

function getValueForWireSet(wireSet: WireSet, letter: string): number {
    const wires = wireSet
        .values()
        .filter((w) => w.id.startsWith(letter))
        .sort((a, b) => {
            const aNum = getNumbers(a.id)[0] as number;
            const bNum = getNumbers(b.id)[0] as number;
            return bNum - aNum;
        });
    return parseInt(wires.map((w) => (w.value ? '1' : '0')).join(''), 2);
}
