import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import {
    CharDirectionMap,
    DirectionsToChars,
    Grid,
    GridCoordinate,
    GridNode,
} from '~/types/Grid';
import { memoize } from '~/util/memoize';

class PadKey extends GridNode {
    readonly value?: string;

    constructor({
        row,
        col,
        value,
    }: GridCoordinate & {
        value?: string;
    }) {
        super({ row, col });
        this.value = value;
    }

    toString() {
        return this.value ?? ' ';
    }
}

type KeyPad = Grid<PadKey>;
type MoveSequences = Map<string, Map<string, string[]>>;

const directionalKeypad = Grid.from2DArray<string | undefined, PadKey>(
    [
        [undefined, DirectionsToChars.up, 'A'],
        [
            DirectionsToChars.left,
            DirectionsToChars.down,
            DirectionsToChars.right,
        ],
    ],
    ({ input, row, col }) => new PadKey({ value: input, row, col }),
);
const numericKeypad = Grid.from2DArray<string | undefined, PadKey>(
    [
        ['7', '8', '9'],
        ['4', '5', '6'],
        ['1', '2', '3'],
        [undefined, '0', 'A'],
    ],
    ({ input, row, col }) => new PadKey({ value: input, row, col }),
);

export const puzzle21 = new Puzzle({
    day: 21,
    parseInput: (fileData) => {
        return splitFilter(fileData);
    },
    part1: (doorCodes) => {
        return calculateComplexityChain({
            doorCodes,
            nDirectionalRobots: 2,
        });
    },
    part2: (doorCodes) => {
        return calculateComplexityChain({
            doorCodes,
            nDirectionalRobots: 25,
        });
    },
});

function calculateComplexityChain({
    doorCodes,
    nDirectionalRobots,
}: {
    doorCodes: string[];
    nDirectionalRobots: number;
}) {
    const nkMoveSequences = buildMoveSequences(numericKeypad);
    const dkMoveSequences = buildMoveSequences(directionalKeypad);

    return doorCodes.reduce((sum, doorCode) => {
        const initialCombos = generateKeyCombo({
            keypad: numericKeypad,
            targetOutput: doorCode,
            moveSequences: nkMoveSequences,
        });

        const calculateComplexity = memoize<
            {
                combo: string;
                iRobot: number;
            },
            number
        >({
            fn: ({ combo, iRobot: currentRobot }) => {
                if (currentRobot === 0) {
                    // Human key presses
                    return shortestPossibleCombos({
                        keypad: directionalKeypad,
                        targetOutput: combo,
                    });
                }
                const matches = combo.matchAll(/[^A]*A/g);
                let sum = 0;
                for (const [match] of matches) {
                    const nextCombos = generateKeyCombo({
                        keypad: directionalKeypad,
                        targetOutput: match,
                        moveSequences: dkMoveSequences,
                    });
                    const complexities = nextCombos.map((nextCombo) =>
                        calculateComplexity({
                            combo: nextCombo,
                            iRobot: currentRobot - 1,
                        }),
                    );
                    sum += Math.min(...complexities);
                }
                return sum;
            },
            key: ({ combo, iRobot }) => `${combo}-${iRobot}`,
        });

        const numericCode = Number(doorCode.slice(0, 3));
        const complexity = Math.min(
            ...initialCombos.map((combo) =>
                calculateComplexity({ combo, iRobot: nDirectionalRobots - 1 }),
            ),
        );
        return sum + numericCode * complexity;
    }, 0);
}

function shortestPossibleCombos({
    keypad,
    targetOutput,
}: {
    keypad: KeyPad;
    targetOutput: string;
}) {
    const start = keypad.find((node) => node?.value === 'A')!;
    const nodesByValue = new Map<string, PadKey>();
    keypad.forEach((node) => {
        if (node?.value) {
            nodesByValue.set(node.value, node);
        }
    });

    let length = 0;

    const targetChars = targetOutput.split('');
    let node = start;
    for (const targetChar of targetChars) {
        const targetNode = nodesByValue.get(targetChar)!;
        length += Grid.manhattanDistance(node, targetNode);
        node = targetNode;
    }

    return length + targetChars.length;
}

function buildMoveSequences(keypad: KeyPad): MoveSequences {
    const moveSequences: MoveSequences = new Map<
        string,
        Map<string, string[]>
    >();

    keypad.forEach((k1) => {
        if (!k1?.value) return;

        const k1MoveSequences =
            moveSequences.get(k1.value) ?? new Map<string, string[]>();
        moveSequences.set(k1.value, k1MoveSequences);

        keypad.forEach((k2) => {
            if (!k1?.value || !k2?.value) return;

            const dRow = k1.row - k2.row;
            const dRowAbs = Math.abs(dRow);
            const dCol = k1.col - k2.col;
            const dColAbs = Math.abs(dCol);

            let sequences: string[] = [];
            if (dRowAbs > 0) {
                sequences.push(
                    Array(dRowAbs)
                        .fill(
                            dRow > 0
                                ? DirectionsToChars.up
                                : DirectionsToChars.down,
                        )
                        .join(''),
                );
            }
            if (dColAbs > 0) {
                const colSeq = Array(dColAbs)
                    .fill(
                        dCol > 0
                            ? DirectionsToChars.left
                            : DirectionsToChars.right,
                    )
                    .join('');
                sequences = sequences.length
                    ? [
                          ...sequences.map((rowSeq) => rowSeq + colSeq),
                          ...sequences.map((rowSeq) => colSeq + rowSeq),
                      ]
                    : [colSeq];
            }

            if (sequences.length === 0) {
                k1MoveSequences.set(k2.value, ['']);
                return;
            }

            const validSequences = sequences.filter((seq) => {
                const directions = seq
                    .split('')
                    .map((char) => CharDirectionMap[char]!);
                let node = k1;
                for (const direction of directions) {
                    node = keypad.getNeighborInDirection(
                        node.row,
                        node.col,
                        direction,
                    )!;
                    if (!node?.value) return false;
                }
                return true;
            });

            k1MoveSequences.set(k2.value, validSequences);
        });
    });
    return moveSequences;
}

function generateKeyCombo({
    keypad,
    targetOutput,
    moveSequences: inputMoveSequences,
}: {
    keypad: KeyPad;
    targetOutput: string;
    moveSequences?: MoveSequences;
}) {
    const moveSequences = inputMoveSequences ?? buildMoveSequences(keypad);

    const targetChars = targetOutput.split('');

    let instructions = [''];

    let currentChar = 'A';

    for (const char of targetChars) {
        const sequences = moveSequences.get(currentChar)?.get(char)!;

        instructions = instructions.flatMap((instruction) =>
            sequences.map((sequence) => instruction + sequence + 'A'),
        );

        currentChar = char;
    }

    return instructions;
}
