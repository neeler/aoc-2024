import { Puzzle } from './Puzzle';
import { getNumbersForEachLine } from '~/util/parsing';

export const puzzle2 = new Puzzle({
    day: 2,
    parseInput: (fileData) => {
        return getNumbersForEachLine(fileData);
    },
    part1: (reports) => {
        return reports.reduce((nSafe, report) => {
            return nSafe + (reportIsSafe(report) ? 1 : 0);
        }, 0);
    },
    part2: (reports) => {
        return reports.reduce((nSafe, report) => {
            const possibleReports = [report];
            for (let i = 0; i < report.length; i++) {
                possibleReports.push(report.toSpliced(i, 1));
            }
            return (
                nSafe +
                (possibleReports.some((report) => reportIsSafe(report)) ? 1 : 0)
            );
        }, 0);
    },
});

function reportIsSafe(report: number[]) {
    const diffs = report.slice(1).map((n, i) => n - report[i]!);
    const firstIsPositive = diffs[0]! > 0;
    return diffs.every((n) => {
        const absDiff = Math.abs(n);
        return (
            absDiff >= 1 &&
            absDiff <= 3 &&
            ((firstIsPositive && n > 0) || (!firstIsPositive && n < 0))
        );
    });
}
