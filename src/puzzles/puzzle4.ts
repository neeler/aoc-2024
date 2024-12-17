import { Puzzle } from './Puzzle';
import { Grid } from '~/types/Grid';

export const puzzle4 = new Puzzle({
    day: 4,
    parseInput: (fileData) => {
        return Grid.fromStringBlock(fileData);
    },
    part1: (grid) => {
        let count = 0;

        grid.forEach((node, iRow, iCol) => {
            const targetLetters = ['X', 'M', 'A', 'S'];
            if (node !== targetLetters[0]) return;

            for (const [dRow, dCol] of Object.values(Grid.directions)) {
                const letters = targetLetters.slice(1);

                let nextLetter = letters.shift();
                let row = iRow + dRow;
                let col = iCol + dCol;

                while (nextLetter && grid.getAt(row, col) === nextLetter) {
                    nextLetter = letters.shift();
                    row += dRow;
                    col += dCol;
                }

                if (!nextLetter) {
                    count++;
                }
            }
        });

        return count;
    },
    part2: (grid) => {
        let count = 0;

        grid.forEach((node, iRow, iCol) => {
            if (node !== 'A') return;

            const diagonal1 = [
                grid.getNeighborInDirection(iRow, iCol, 'upLeft'),
                grid.getNeighborInDirection(iRow, iCol, 'downRight'),
            ]
                .sort()
                .join('');

            const diagonal2 = [
                grid.getNeighborInDirection(iRow, iCol, 'upRight'),
                grid.getNeighborInDirection(iRow, iCol, 'downLeft'),
            ]
                .sort()
                .join('');

            if (diagonal1 === 'MS' && diagonal2 === 'MS') {
                count++;
            }
        });

        return count;
    },
});
