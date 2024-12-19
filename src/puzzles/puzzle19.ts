import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { memoize } from '~/util/memoize';

export const puzzle19 = new Puzzle({
    day: 19,
    parseInput: (fileData) => {
        const [t, d] = splitFilter(fileData, '\n\n') as [string, string];
        const towels = t.split(', ');
        const designs = d.split('\n');
        return {
            towels,
            designs,
        };
    },
    part1: ({ towels, designs }) => {
        const isPossible = memoize<string, boolean>({
            key: (design) => design,
            fn: (design): boolean =>
                towels.some((towel) => {
                    if (!design.startsWith(towel)) {
                        return false;
                    }

                    const remainingDesign = design.slice(towel.length);
                    if (!remainingDesign) {
                        return true;
                    }

                    return isPossible(remainingDesign);
                }),
        });

        return designs.reduce(
            (sum, design) => sum + (isPossible(design) ? 1 : 0),
            0,
        );
    },
    part2: ({ towels, designs }) => {
        const getNumCombos = memoize<string, number>({
            key: (design) => design,
            fn: (design): number =>
                towels.reduce((sum, towel) => {
                    if (!design.startsWith(towel)) {
                        return sum;
                    }

                    const remainingDesign = design.slice(towel.length);
                    if (!remainingDesign) {
                        return sum + 1;
                    }

                    return sum + getNumCombos(remainingDesign);
                }, 0),
        });

        return designs.reduce((sum, design) => sum + getNumCombos(design), 0);
    },
});
