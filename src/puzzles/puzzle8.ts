import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { Grid } from '~/types/Grid';

class Node {
    readonly char: string;
    readonly row: number;
    readonly col: number;
    readonly antenna?: string;
    antinode = false;

    constructor({
        char,
        row,
        col,
    }: {
        char: string;
        row: number;
        col: number;
    }) {
        this.char = char;
        this.row = row;
        this.col = col;
        this.antenna = this.char !== '.' ? this.char : undefined;
    }

    toString() {
        if (this.antenna) return this.antenna;
        if (this.antinode) return '#';
        return this.char;
    }
}

export const puzzle8 = new Puzzle({
    day: 8,
    parseInput: (fileData) => {
        const data = splitFilter(fileData).map((s) => splitFilter(s, ''));
        const grid = new Grid<Node>({
            maxX: data[0]!.length - 1,
            maxY: data.length - 1,
            defaultValue: (row, col) =>
                new Node({
                    char: data[row]![col]!,
                    row,
                    col,
                }),
        });
        const antennasByType = new Map<string, Node[]>();
        grid.forEach((node) => {
            if (node?.antenna) {
                antennasByType.set(node.antenna, [
                    ...(antennasByType.get(node.antenna) ?? []),
                    node,
                ]);
            }
        });
        const distinctAntennaPairsByType = new Map<
            string,
            [Node, Node, number, number][]
        >();
        for (const [type, antennas] of antennasByType.entries()) {
            const distinctPairs: [Node, Node, number, number][] = [];
            antennas.forEach((a1, i) => {
                antennas.slice(i + 1).forEach((a2) => {
                    distinctPairs.push([
                        a1,
                        a2,
                        a1.row - a2.row,
                        a1.col - a2.col,
                    ]);
                });
            });
            distinctAntennaPairsByType.set(type, distinctPairs);
        }
        return {
            grid,
            antennasByType,
            distinctAntennaPairsByType,
        };
    },
    part1: ({ grid, distinctAntennaPairsByType }) => {
        for (const distinctPairs of distinctAntennaPairsByType.values()) {
            for (const [a1, a2, dRow, dCol] of distinctPairs) {
                const node1 = grid.get({
                    row: a1.row + dRow,
                    col: a1.col + dCol,
                });
                const node2 = grid.get({
                    row: a2.row - dRow,
                    col: a2.col - dCol,
                });
                [node1, node2].forEach((node) => {
                    if (node) node.antinode = true;
                });
            }
        }
        return grid.filter((node) => node.antinode).length;
    },
    part2: ({ grid, distinctAntennaPairsByType }) => {
        for (const distinctPairs of distinctAntennaPairsByType.values()) {
            for (const [a1, a2, dRow, dCol] of distinctPairs) {
                let node: Node | undefined = a1;
                while (node) {
                    node.antinode = true;
                    node = grid.get({
                        row: node.row + dRow,
                        col: node.col + dCol,
                    });
                }

                node = a2;
                while (node) {
                    node.antinode = true;
                    node = grid.get({
                        row: node.row - dRow,
                        col: node.col - dCol,
                    });
                }
            }
        }
        return grid.filter((node) => node.antinode).length;
    },
});
