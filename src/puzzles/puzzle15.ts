import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import {
    CharDirectionMap,
    Direction,
    Grid,
    GridCoordinate,
} from '~/types/Grid';

class Box {
    coordinates: GridCoordinate[];

    constructor(coordinates: GridCoordinate[]) {
        this.coordinates = coordinates;
    }

    move(direction: Direction, grid: Grid<Node>) {
        this.coordinates = this.coordinates.map((coordinate) =>
            grid.getCoordsInDirection(
                coordinate.row,
                coordinate.col,
                direction,
            ),
        );
    }
}

class Node {
    readonly row: number;
    readonly col: number;
    isWall: boolean;
    box?: Box;
    hasRobot: boolean;

    constructor({
        row,
        col,
        isWall,
        box,
        hasRobot,
    }: {
        row: number;
        col: number;
        isWall: boolean;
        box?: Box;
        hasRobot: boolean;
    }) {
        this.row = row;
        this.col = col;
        this.isWall = isWall;
        this.box = box;
        this.hasRobot = hasRobot;
    }

    toString() {
        if (this.isWall) {
            return '#';
        }
        if (this.hasRobot) {
            return '@';
        }
        if (this.box) {
            if (this.box.coordinates.length === 1) {
                return 'O';
            }
            if (this.box.coordinates[0]!.col === this.col) {
                return '[';
            }
            return ']';
        }
        return '.';
    }
}

export const puzzle15 = new Puzzle({
    day: 15,
    parseInput: (fileData) => fileData,
    part1: (fileData) => {
        const { grid, instructions, robot } = parseInput(fileData);
        for (const instruction of instructions) {
            move(grid, robot, instruction);
        }
        return grid.reduce((sum, node) => {
            return sum + (node?.box ? node.row * 100 + node.col : 0);
        }, 0);
    },
    part2: (fileData) => {
        const { grid, instructions, robot } = parseInput(fileData, 2);
        for (const instruction of instructions) {
            move(grid, robot, instruction);
        }
        const boxes = new Set<Box>();
        grid.forEach((node) => {
            if (node?.box) {
                boxes.add(node.box);
            }
        });
        return Array.from(boxes).reduce((sum, box) => {
            const topLeft = box.coordinates[0]!;
            return sum + (topLeft.row * 100 + topLeft.col);
        }, 0);
    },
});

function parseInput(fileData: string, widthMultiplier = 1) {
    const data = splitFilter(fileData).map((line) => splitFilter(line, ''));
    const warehouseData: string[][] = [];
    let edgesSeen = 0;
    for (let i = 0; i < data.length; i++) {
        const row = data[i]!;
        if (row.every((char) => char === '#')) {
            edgesSeen++;
        }
        warehouseData.push(row);
        if (edgesSeen === 2) {
            break;
        }
    }
    const grid = new Grid<Node>({
        maxX: warehouseData[0]!.length * widthMultiplier - 1,
        maxY: warehouseData.length - 1,
        defaultValue: (row, col) =>
            new Node({
                row,
                col,
                hasRobot: false,
                isWall: false,
            }),
    });
    warehouseData.forEach((row, iRow) => {
        row.forEach((char, iCol) => {
            const isBox = char === 'O';
            const boxCoordinates: GridCoordinate[] = isBox
                ? Array.from({ length: widthMultiplier }, (_, i) => ({
                      row: iRow,
                      col: iCol * widthMultiplier + i,
                  }))
                : [];
            const box = isBox ? new Box(boxCoordinates) : undefined;
            for (let i = 0; i < widthMultiplier; i++) {
                const node = grid.getAt(iRow, iCol * widthMultiplier + i);
                if (node) {
                    node.isWall = char === '#';
                    node.hasRobot = char === '@' && i === 0;
                    node.box = box;
                }
            }
        });
    });
    const instructions: Direction[] = [];
    for (let i = warehouseData.length; i < data.length; i++) {
        const row = data[i]!;
        for (const char of row) {
            const direction = CharDirectionMap[char];
            if (direction) {
                instructions.push(direction);
            }
        }
    }
    const robot = grid.find((node) => node!.hasRobot)!;
    return {
        grid,
        instructions,
        robot: {
            row: robot.row,
            col: robot.col,
        },
    };
}

function move(
    grid: Grid<Node>,
    robot: { row: number; col: number },
    instruction: Direction,
) {
    let node: Node | undefined = grid.get(robot)!;
    const batchesToMove: Node[][] = [[node]];

    while (true) {
        const lastBatch = batchesToMove[batchesToMove.length - 1]!;
        const nextBatch: Node[] = [];

        for (const node of lastBatch) {
            const nextNode = grid.getNeighborInDirection(
                node.row,
                node.col,
                instruction,
            );
            if (!nextNode || nextNode.isWall) {
                return;
            }
            if (nextNode.box) {
                if (
                    nextNode.box.coordinates.length > 1 &&
                    (instruction === 'up' || instruction === 'down')
                ) {
                    for (const boxNode of nextNode.box.coordinates) {
                        nextBatch.push(grid.get(boxNode)!);
                    }
                } else {
                    nextBatch.push(nextNode);
                }
            }
        }

        if (nextBatch.length === 0 || nextBatch.every((node) => !node.box)) {
            break;
        }

        batchesToMove.push(nextBatch);
    }

    const boxesSeen = new Set<Box>();
    for (const batch of batchesToMove.toReversed()) {
        for (const n of batch) {
            if (n.hasRobot) {
                const nextNode = grid.getNeighborInDirection(
                    n.row,
                    n.col,
                    instruction,
                )!;
                nextNode.hasRobot = n.hasRobot;
                n.hasRobot = false;
            } else if (n.box) {
                boxesSeen.add(n.box);
                n.box = undefined;
            }
        }
    }

    for (const box of boxesSeen) {
        box.move(instruction, grid);
        box.coordinates.forEach((c) => {
            const node = grid.get(c)!;
            node.box = box;
        });
    }

    const nextRobotNode = grid.getNeighborInDirection(
        robot.row,
        robot.col,
        instruction,
    )!;
    robot.row = nextRobotNode.row;
    robot.col = nextRobotNode.col;

    return;
}
