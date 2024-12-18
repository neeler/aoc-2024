import { Puzzle } from './Puzzle';
import { getNumbers, splitFilter } from '~/util/parsing';
import { Grid, GridNode } from '~/types/Grid';
import { mod } from '~/util/arithmetic';

class Robot {
    x: number;
    y: number;
    dx: number;
    dy: number;

    constructor({
        x,
        y,
        dx,
        dy,
    }: {
        x: number;
        y: number;
        dx: number;
        dy: number;
    }) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
    }

    static fromString(str: string) {
        const [x, y, dx, dy] = getNumbers(str);
        if (
            x === undefined ||
            y === undefined ||
            dx === undefined ||
            dy === undefined
        ) {
            throw new Error('Invalid input');
        }
        return new Robot({
            x,
            y,
            dx,
            dy,
        });
    }
}

class Node extends GridNode {
    readonly robots = new Set<Robot>();

    toString() {
        return (this.robots.size || '.').toString();
    }
}

export const puzzle14 = new Puzzle({
    day: 14,
    parseInput: (fileData) => fileData,
    part1: (fileData) => {
        const { grid, robots } = parseInput(fileData);
        tickGrid(grid, robots, 100);
        return safetyScore(grid);
    },
    part2: async (fileData) => {
        const { grid, robots } = parseInput(fileData);
        let t = 0;
        while (true) {
            t++;
            tickGrid(grid, robots, 1);

            let hasMultipleRobots = false;
            grid.forEach((node) => {
                if (node && node.robots.size > 1) {
                    hasMultipleRobots = true;
                }
            });

            if (!hasMultipleRobots) {
                break;
            }
        }

        return t;
    },
});

function parseInput(fileData: string) {
    const robots = splitFilter(fileData).map((line) => Robot.fromString(line));
    const grid = Grid.fromSize({
        width: 101,
        height: 103,
        defaultValue: (row, col) =>
            new Node({
                row,
                col,
            }),
    });
    robots.forEach((robot) => {
        grid.getAt(robot.y, robot.x)?.robots.add(robot);
    });
    return {
        grid,
        robots,
    };
}

function tickGrid(grid: Grid<Node>, robots: Robot[], nSeconds: number) {
    for (let t = 0; t < nSeconds; t++) {
        robots.forEach((robot) => {
            grid.getAt(robot.y, robot.x)!.robots.delete(robot);
            robot.x = mod(robot.x + robot.dx, grid.width);
            robot.y = mod(robot.y + robot.dy, grid.height);
            grid.getAt(robot.y, robot.x)!.robots.add(robot);
        });
    }
}

function safetyScore(grid: Grid<Node>) {
    const halfHeight = grid.height / 2;
    const halfWidth = grid.width / 2;
    const quadrants = [
        {
            minX: 0,
            maxX: Math.floor(halfWidth) - 1,
            minY: 0,
            maxY: Math.floor(halfHeight) - 1,
        },
        {
            minX: Math.ceil(halfWidth),
            maxX: grid.width - 1,
            minY: 0,
            maxY: Math.floor(halfHeight) - 1,
        },
        {
            minX: 0,
            maxX: Math.floor(halfWidth) - 1,
            minY: Math.ceil(halfHeight),
            maxY: grid.height - 1,
        },
        {
            minX: Math.ceil(halfWidth),
            maxX: grid.width - 1,
            minY: Math.ceil(halfHeight),
            maxY: grid.height - 1,
        },
    ];
    return quadrants.reduce((product, { minX, minY, maxX, maxY }) => {
        const nRobots = grid.reduce((sum, node) => {
            if (
                node &&
                node.row >= minY &&
                node.row <= maxY &&
                node.col >= minX &&
                node.col <= maxX &&
                node.robots.size
            ) {
                return sum + node.robots.size;
            }
            return sum;
        }, 0);
        return product * nRobots;
    }, 1);
}
