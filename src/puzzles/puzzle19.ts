import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { Queue } from '~/types/Queue';
import { Stack } from '~/types/Stack';
import { CustomSet } from '~/types/CustomSet';

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
        return getPossibleDesigns({ designs, towels }).length;
    },
    part2: ({ towels, designs }) => {
        const possibleDesigns = getPossibleDesigns({ designs, towels });
        const possibleCombosPerDesign = new Map<string, number>();
        const relevantTowelsPerDesign = new Map<string, string[]>();

        for (const design of possibleDesigns) {
            relevantTowelsPerDesign.set(
                design,
                towels.filter((towel) => design.includes(towel)),
            );
        }

        function getNumCombos({
            design,
            towels,
        }: {
            design: string;
            towels: string[];
        }): number {
            if (possibleCombosPerDesign.has(design)) {
                return possibleCombosPerDesign.get(design)!;
            }

            const numCombos = towels.reduce((sum, towel) => {
                if (!design.startsWith(towel)) return sum;

                const remainingDesign = design.slice(towel.length);
                if (!remainingDesign) return sum + 1;

                return (
                    sum +
                    getNumCombos({
                        design: remainingDesign,
                        towels,
                    })
                );
            }, 0);

            possibleCombosPerDesign.set(design, numCombos);

            return numCombos;
        }

        return possibleDesigns.reduce(
            (sum, design) =>
                sum +
                getNumCombos({
                    design,
                    towels: relevantTowelsPerDesign.get(design)!,
                }),
            0,
        );
    },
});

function getPossibleDesigns({
    designs,
    towels,
}: {
    designs: string[];
    towels: string[];
}): string[] {
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

    return possibleDesigns;
}
