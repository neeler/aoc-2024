import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { Stack } from '~/types/Stack';
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
        const possibleDesigns: string[] = [];

        for (const design of designs) {
            const queue = new Stack<string>();
            const designsSeen = new Set<string>();
            queue.add(design);
            queue.process((designSoFar) => {
                for (const towel of towels) {
                    if (designSoFar === towel) {
                        possibleDesigns.push(design);
                        queue.reset();
                        return;
                    }

                    if (designSoFar.startsWith(towel)) {
                        const nextDesign = designSoFar.slice(towel.length);
                        if (designsSeen.has(nextDesign)) {
                            continue;
                        }
                        designsSeen.add(nextDesign);
                        queue.add(nextDesign);
                    }
                }
            });
        }

        return possibleDesigns.length;
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
