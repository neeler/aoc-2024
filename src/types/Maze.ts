import { Grid, GridCoordinate, GridNode } from '~/types/Grid';
import { Queue } from '~/types/Queue';

class MazeNode extends GridNode {
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

    score({ start, end }: { start: MazeNode; end: MazeNode }) {
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

        return end.bestScore;
    }

    resetScores() {
        this.forEach((node) => {
            if (node) {
                node.bestScore = Infinity;
            }
        });
    }
}
