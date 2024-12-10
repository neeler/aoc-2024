import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { Grid } from '~/types/Grid';
import { Queue } from '~/types/Queue';

class Node {
    readonly height: number;
    readonly row: number;
    readonly col: number;

    constructor({
        height,
        row,
        col,
    }: {
        height: number;
        row: number;
        col: number;
    }) {
        this.height = height;
        this.row = row;
        this.col = col;
    }

    toString() {
        return this.height.toString();
    }
}

export const puzzle10 = new Puzzle({
    day: 10,
    parseInput: (fileData) => {
        const data = splitFilter(fileData).map((line) => splitFilter(line, ''));
        const grid = new Grid<Node>({
            maxX: data[0]!.length - 1,
            maxY: data.length - 1,
            defaultValue: (row, col) =>
                new Node({
                    height: Number(data[row]![col]!),
                    row,
                    col,
                }),
        });
        const trailHeads = grid.reduce<
            {
                node: Node;
                score: number;
                rating: number;
            }[]
        >((acc, node) => {
            if (node?.height !== 0) {
                return acc;
            }

            let peaksSeen = new Set<Node>();
            let nPaths = 0;
            const queue = new Queue<Node>();
            queue.add(node);
            queue.process((node) => {
                if (node.height === 9) {
                    peaksSeen.add(node);
                    nPaths++;
                    return;
                }
                const neighbors = grid.getOrthogonalNeighborsOf(
                    node.row,
                    node.col,
                );
                neighbors.forEach((neighbor) => {
                    if (neighbor.height === node.height + 1) {
                        queue.add(neighbor);
                    }
                });
            });

            if (peaksSeen.size > 0) {
                acc.push({
                    node,
                    score: peaksSeen.size,
                    rating: nPaths,
                });
            }
            return acc;
        }, []);

        return {
            grid,
            trailHeads,
        };
    },
    part1: ({ trailHeads }) => {
        return trailHeads.reduce((acc, { score }) => acc + score, 0);
    },
    part2: ({ trailHeads }) => {
        return trailHeads.reduce((acc, { rating }) => acc + rating, 0);
    },
});