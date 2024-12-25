import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { Grid } from '~/types/Grid';
import { CustomSet } from '~/types/CustomSet';

type Lock = number[];
type Key = number[];
type Component = Lock | Key;

export const puzzle25 = new Puzzle({
    day: 25,
    parseInput: (fileData) => {
        const locks: Lock[] = [];
        const keys: Key[] = [];

        let height = 0;

        splitFilter(fileData, '\n\n').forEach((schematic) => {
            const grid = Grid.fromStringBlock(schematic);
            height = grid.height - 2;
            if (grid.getRow(0).every((c) => c === '#')) {
                locks.push(parseSchematic(grid));
            } else {
                keys.push(parseSchematic(grid));
            }
        });

        return { locks, keys, height };
    },
    part1: ({ locks, keys, height }) => {
        const matchingPairs = new CustomSet<[number, number]>({
            getKey: ([a, b]) => `${a},${b}`,
        });
        for (const [iLock, lock] of locks.entries()) {
            for (const [iKey, key] of keys.entries()) {
                if (lock.every((l, i) => l + key[i]! <= height)) {
                    matchingPairs.add([iLock, iKey]);
                }
            }
        }
        return matchingPairs.size;
    },
    part2: () => {
        // Got all stars!
        return true;
    },
});

function parseSchematic(grid: Grid<string>): Component {
    const component: Component = [];
    for (let col = 0; col < grid.width; col++) {
        component.push(grid.getColumn(col).filter((c) => c === '#').length - 1);
    }
    return component;
}
