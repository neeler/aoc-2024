import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

export const puzzle3 = new Puzzle({
    day: 3,
    parseInput: (fileData) => {
        return splitFilter(fileData);
    },
    part1: (lines) => {
        const validCommandRegex = /mul\((\d{1,3}),(\d{1,3})\)/g;
        let total = 0;
        lines.forEach((line) => {
            const matches = [...line.matchAll(validCommandRegex)];
            for (const [, first = '', second = ''] of matches) {
                total += Number(first) * Number(second);
            }
        });
        return total;
    },
    part2: (lines) => {
        let total = 0;
        let mulEnabled = true;

        const commandRegex =
            /(mul\((\d{1,3}),(\d{1,3})\))|(do\(\))|(don't\(\))/g;

        lines.forEach((line) => {
            for (const [
                ,
                ,
                first = '',
                second = '',
                doCommand,
                dontCommand,
            ] of line.matchAll(commandRegex)) {
                if (doCommand) {
                    mulEnabled = true;
                } else if (dontCommand) {
                    mulEnabled = false;
                } else if (mulEnabled) {
                    total += Number(first) * Number(second);
                }
            }
        });

        return total;
    },
});
