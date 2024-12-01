import { Puzzle } from './Puzzle';

export const puzzle1 = new Puzzle({
    day: 1,
    parseInput: (fileData) => {
        const leftList: number[] = [];
        const rightList: number[] = [];
        fileData
            .split('\n')
            .filter((s) => s)
            .forEach((s) => {
                const [left = '', right = ''] = s.split(/\s+/);
                leftList.push(Number.parseInt(left, 10));
                rightList.push(Number.parseInt(right, 10));
            });

        if (rightList.length !== leftList.length) {
            throw new Error('Lists should be the same length!');
        }

        return {
            leftList,
            rightList,
        };
    },
    part1: ({ leftList, rightList }) => {
        const sortedLeft = leftList.toSorted((a, b) => a - b);
        const sortedRight = rightList.toSorted((a, b) => a - b);
        return sortedLeft.reduce((sum, left, i) => {
            const right = sortedRight[i] ?? 0;
            const distance = Math.abs(left - right);
            return sum + distance;
        }, 0);
    },
    part2: ({ leftList, rightList }) => {
        const rightCounts = new Map<number, number>();
        rightList.forEach((n) => {
            rightCounts.set(n, (rightCounts.get(n) ?? 0) + 1);
        });
        return leftList.reduce((sum, left) => {
            return sum + left * (rightCounts.get(left) ?? 0);
        }, 0);
    },
});
