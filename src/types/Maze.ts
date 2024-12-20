import { Grid, GridCoordinate, GridNode } from '~/types/Grid';
import { Queue } from '~/types/Queue';
import { parseStringBlock } from '~/util/parsing';

export class MazeNode extends GridNode {
    char?: string;
    obstacle: boolean;
    bestScore = Infinity;

    constructor({
        row,
        col,
        obstacle = false,
    }: GridCoordinate & {
        obstacle?: boolean;
    }) {
        super({ row, col });
        this.obstacle = obstacle;
    }

    toString() {
        if (this.obstacle) {
            return '#';
        }

        if (this.bestScore !== Infinity) {
            return this.bestScore.toString().slice(-1);
        }

        if (this.char) {
            return this.char;
        }

        return '.';
    }
}

export class Maze extends Grid<MazeNode> {
    constructor({ width, height }: { width: number; height: number }) {
        super({
            maxX: width - 1,
            maxY: height - 1,
            defaultValue: (row, col) => new MazeNode({ row, col }),
        });
    }

    static fromMazeString(
        block: string,
        {
            obstacleChar = '#',
        }: {
            obstacleChar?: string;
        } = {},
    ) {
        const data = parseStringBlock(block);
        const width = Math.max(...data.map((row) => row.length));
        const height = data.length;
        const maze = new Maze({
            width,
            height,
        });

        if (obstacleChar) {
            maze.forEach((node, row, col) => {
                if (node) {
                    node.char = data[row]?.[col];
                    node.obstacle = node.char === obstacleChar;
                }
            });
        }

        return maze;
    }

    score({
        start,
        end,
        resetAfter = true,
    }: {
        start: MazeNode;
        end: MazeNode;
        resetAfter?: boolean;
    }) {
        const queue = new Queue<MazeNode>();
        start.bestScore = 0;
        queue.add(start);

        queue.process((node) => {
            if (node === end) {
                return;
            }

            const score = node.bestScore;
            const neighbors = this.getOrthogonalNeighborsOf(node.row, node.col);
            neighbors.forEach((neighbor) => {
                if (neighbor.bestScore <= score + 1 || neighbor.obstacle) {
                    return;
                }

                neighbor.bestScore = score + 1;

                queue.add(neighbor);
            });
        });

        const score = end.bestScore;

        if (resetAfter) {
            this.resetScores();
        }

        return score;
    }

    resetScores() {
        this.forEach((node) => {
            if (node) {
                node.bestScore = Infinity;
            }
        });
    }
}
