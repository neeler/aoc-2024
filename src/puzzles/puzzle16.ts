import { Puzzle } from './Puzzle';
import { Direction, Grid, GridCoordinate, GridNode } from '~/types/Grid';
import { Queue } from '~/types/Queue';

class Node extends GridNode {
    readonly isWall: boolean;
    readonly isStart: boolean;
    readonly isEnd: boolean;

    constructor({
        row,
        col,
        isWall,
        isStart,
        isEnd,
    }: {
        isWall: boolean;
        isStart: boolean;
        isEnd: boolean;
    } & GridCoordinate) {
        super({ row, col });
        this.isWall = isWall;
        this.isStart = isStart;
        this.isEnd = isEnd;
    }

    key(direction: Direction) {
        return `${this.row},${this.col},${direction}`;
    }

    toString() {
        if (this.isStart) return 'S';
        if (this.isEnd) return 'E';
        if (this.isWall) return '#';
        return '.';
    }
}

const turnMaps: Record<string, Direction[]> = {
    up: ['left', 'right'],
    down: ['right', 'left'],
    left: ['down', 'up'],
    right: ['up', 'down'],
};

export const puzzle16 = new Puzzle({
    day: 16,
    parseInput: (fileData) => {
        const grid = Grid.stringToNodeGrid(
            fileData,
            ({ input, row, col }) =>
                new Node({
                    row,
                    col,
                    isWall: input === '#',
                    isStart: input === 'S',
                    isEnd: input === 'E',
                }),
        );
        return analyzeBestPaths(grid);
    },
    part1: ({ bestScore }) => {
        return bestScore;
    },
    part2: ({ nodesOnBestPaths }) => {
        return nodesOnBestPaths.size;
    },
});

function analyzeBestPaths(grid: Grid<Node>) {
    let bestScore = Infinity;
    const bestPathsSeen = new Map<string, number>();
    const queue = new Queue<{
        node: Node;
        score: number;
        direction: Direction;
        nodesSeen: Set<Node>;
    }>();
    let bestNodeSets: Set<Node>[] = [];

    const start = grid.find((node) => node!.isStart)!;

    queue.add({
        node: start,
        score: 0,
        direction: 'right',
        nodesSeen: new Set([start]),
    });
    queue.process(({ node, score, direction, nodesSeen }) => {
        if (node.isEnd) {
            if (score <= bestScore) {
                if (score === bestScore) {
                    bestNodeSets.push(nodesSeen);
                } else {
                    bestScore = score;
                    bestNodeSets = [nodesSeen];
                }
            }

            return;
        }

        const nextNode = grid.getNeighborInDirection(
            node.row,
            node.col,
            direction,
        );
        if (nextNode && !nextNode.isWall) {
            const key = nextNode.key(direction);
            const bestScoreSoFar = bestPathsSeen.get(key) ?? Infinity;
            const newScore = score + 1;
            if (newScore <= bestScoreSoFar) {
                bestPathsSeen.set(key, newScore);
                const newNodeSet = new Set(nodesSeen);
                newNodeSet.add(nextNode);
                queue.add({
                    node: nextNode,
                    score: newScore,
                    direction,
                    nodesSeen: newNodeSet,
                });
            }
        }

        const turnDirections = turnMaps[direction]!;
        for (const turnDirection of turnDirections) {
            const key = node.key(turnDirection);
            const bestScoreSoFar = bestPathsSeen.get(key) ?? Infinity;
            const newScore = score + 1000;
            if (newScore <= bestScoreSoFar) {
                bestPathsSeen.set(key, newScore);
                queue.add({
                    node,
                    score: newScore,
                    direction: turnDirection,
                    nodesSeen,
                });
            }
        }
    });

    const nodesOnBestPaths = new Set<Node>();
    bestNodeSets.forEach((nodeSet) => {
        nodeSet.forEach((node) => {
            nodesOnBestPaths.add(node);
        });
    });

    return {
        grid,
        bestScore,
        nodesOnBestPaths,
    };
}
