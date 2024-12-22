import { Puzzle } from './Puzzle';
import {
    Direction,
    DirectionKeys,
    Grid,
    GridCoordinate,
    GridNode,
} from '~/types/Grid';
import { CustomSet } from '~/types/CustomSet';

const rightTurnMap = {
    [DirectionKeys.up]: DirectionKeys.right,
    [DirectionKeys.right]: DirectionKeys.down,
    [DirectionKeys.down]: DirectionKeys.left,
    [DirectionKeys.left]: DirectionKeys.up,
};

class Node extends GridNode {
    char: string;
    obstacle: boolean;
    isStart: boolean;

    constructor({ row, col, input }: GridCoordinate & { input: string }) {
        super({ row, col });
        this.char = input;
        this.obstacle = input === '#';
        this.isStart = input === '^';
    }

    toString() {
        return this.char;
    }
}

type NodeSet = CustomSet<Node>;

export const puzzle6 = new Puzzle({
    day: 6,
    parseInput: (fileData) => {
        const grid = Grid.stringToNodeGrid(fileData, (data) => new Node(data));
        return {
            grid,
            start: grid.find((node) => node?.isStart)!,
        };
    },
    part1: ({ grid, start }) => {
        const guardPath = walkGrid({ grid, start });
        return guardPath.size;
    },
    part2: ({ grid, start }) => {
        let obstaclePositions = 0;

        const obstacles = findObstacles(grid);

        /**
         * Try placing an obstacle at each node along the guard's path
         */
        walkGrid({ grid, start, obstacles })
            .values()
            .slice(1) // Skip the starting position, can't put an obstacle there
            .forEach((node) => {
                obstacles.add(node);

                try {
                    walkGrid({ grid, start, obstacles });
                } catch {
                    // Loop detected
                    obstaclePositions++;
                }

                obstacles.delete(node);
            });

        return obstaclePositions;
    },
});

function newNodeSet(): NodeSet {
    return new CustomSet<Node>({
        getKey: (node) => `${node.row},${node.col}`,
    });
}

function findObstacles(grid: Grid<Node>) {
    const obstacles = newNodeSet();
    grid.forEach((node) => {
        if (node?.obstacle) {
            obstacles.add(node);
        }
    });
    return obstacles;
}

function walkGrid({
    grid,
    start,
    obstacles: inputObstacles,
}: {
    grid: Grid<Node>;
    start: Node;
    obstacles?: CustomSet<Node>;
}) {
    let row = start.row;
    let col = start.col;
    let direction = DirectionKeys.up;

    const obstacles = inputObstacles ?? findObstacles(grid);

    const positions = newNodeSet();
    const directionalPositions = new CustomSet<{
        node: Node;
        direction: Direction;
    }>({
        getKey: ({ node, direction }) => `${node.row},${node.col},${direction}`,
    });
    positions.add(start);
    directionalPositions.add({ node: start, direction });

    while (true) {
        const node = grid.getNeighborInDirection(row, col, direction);

        if (!node) {
            // Reached the end of the grid
            break;
        }

        if (obstacles.has(node)) {
            // Turn right
            direction = rightTurnMap[direction]!;
        } else {
            // Move forward
            row = node.row;
            col = node.col;
            positions.add(node);
        }

        if (directionalPositions.has({ node, direction })) {
            // We've seen this position before, so it's a loop
            throw new Error('Loop detected');
        }

        directionalPositions.add({ node, direction });
    }

    return positions;
}
