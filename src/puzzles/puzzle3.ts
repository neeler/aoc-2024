import { Puzzle } from './Puzzle';

export const puzzle3 = new Puzzle({
    day: 3,
    parseInput: (fileData) => {
        return fileData.split('\n').filter((s) => s);
    },
    part1: (lines) => {
        const validCommandRegex = /mul\((\d{1,3}),(\d{1,3})\)/g;
        let total = 0;
        lines.forEach((line) => {
            const matches = [...line.matchAll(validCommandRegex)];
            for (const [, first = '', second = ''] of matches) {
                total +=
                    Number.parseInt(first, 10) * Number.parseInt(second, 10);
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
            const matches = [...line.matchAll(commandRegex)];
            for (const [
                ,
                ,
                first = '',
                second = '',
                doCommand,
                dontCommand,
            ] of matches) {
                if (doCommand) {
                    mulEnabled = true;
                } else if (dontCommand) {
                    mulEnabled = false;
                } else if (mulEnabled) {
                    total +=
                        Number.parseInt(first, 10) *
                        Number.parseInt(second, 10);
                }
            }
        });

        return total;
    },
});
