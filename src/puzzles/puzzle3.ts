import { Puzzle } from './Puzzle';

export const puzzle3 = new Puzzle({
    day: 3,
    parseInput: (fileData) => {
        return fileData.split('\n').filter((s) => s);
    },
    part1: (data) => {
        console.log(data);
    },
    part2: (data) => {
        //
    },
});
