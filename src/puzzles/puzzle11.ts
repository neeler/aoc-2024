import { Puzzle } from './Puzzle';
import { parseNumberList } from '~/util/parsing';

export const puzzle11 = new Puzzle({
    day: 11,
    parseInput: (fileData) => {
        return parseNumberList(fileData, ' ');
    },
    part1: (stones) => {
        const nBlinks = 25;

        let result = stones;
        for (let i = 0; i < nBlinks; i++) {
            result = result.map((stone) => blink(stone)).flat();
        }
        return result.length;
    },
    part2: (stones) => {
        const nBlinks = 75;

        let stoneCounts = new Map<number, number>();
        stones.forEach((stone) => {
            stoneCounts.set(stone, 1 + (stoneCounts.get(stone) ?? 0));
        });

        for (let i = 0; i < nBlinks; i++) {
            const newStoneCountMap = new Map<number, number>();
            for (const [stone, count] of stoneCounts) {
                for (const newStone of blink(stone)) {
                    newStoneCountMap.set(
                        newStone,
                        count + (newStoneCountMap.get(newStone) ?? 0),
                    );
                }
            }
            stoneCounts = newStoneCountMap;
        }

        return Array.from(stoneCounts.values()).reduce(
            (count, b) => count + b,
            0,
        );
    },
});

function blink(stone: number): number[] {
    if (stone === 0) {
        return [1];
    }
    const stoneString = stone.toString();
    if (stoneString.length % 2 === 0) {
        return [
            stoneString.slice(0, stoneString.length / 2),
            stoneString.slice(stoneString.length / 2),
        ].map(Number);
    }
    return [stone * 2024];
}
