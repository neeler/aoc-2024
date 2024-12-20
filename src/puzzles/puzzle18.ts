import { Puzzle } from './Puzzle';
import { getNumbersForEachLine } from '~/util/parsing';
import { Maze } from '~/types/Maze';

export const puzzle18 = new Puzzle({
    day: 18,
    parseInput: (fileData, { example, part }) => {
        const maze = new Maze({
            width: example ? 7 : 71,
            height: example ? 7 : 71,
        });
        const byteNodes = getNumbersForEachLine(fileData).map(
            ([col, row]) => maze.getAt(row!, col!)!,
        );
        const start = maze.getAt(0, 0)!;
        const end = maze.getAt(maze.height - 1, maze.width - 1)!;
        return {
            maze,
            start,
            end,
            byteNodes:
                example && part === 1 ? byteNodes.slice(0, 12) : byteNodes,
        };
    },
    part1: ({ maze, start, end, byteNodes }) => {
        byteNodes.slice(0, 1024).forEach((node) => {
            node.obstacle = true;
        });

        return maze.score({
            start,
            end,
        });
    },
    part2: ({ maze, start, end, byteNodes }) => {
        for (const byte of byteNodes) {
            byte.obstacle = true;
            if (
                maze.score({
                    start,
                    end,
                }) === Infinity
            ) {
                return [byte.col, byte.row].join(',');
            }
        }
        throw new Error('No blocking byte found');
    },
});
