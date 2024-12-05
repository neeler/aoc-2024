import { Puzzle } from './Puzzle';
import { sum } from '~/util/arithmetic';
import { splitFilter, parseNumberList } from '~/util/parsing';
import { itemToIndexMap, middleItem } from '~/util/collections';
import { CustomSet } from '~/types/CustomSet';
import { isUndefined } from '~/util/nullish';

type Rule = [number, number];
type Update = number[];

export const puzzle5 = new Puzzle({
    day: 5,
    parseInput: (fileData) => {
        const [ruleSection = '', updateSection = ''] = splitFilter(
            fileData,
            '\n\n',
        );

        const rules = splitFilter(ruleSection).map((s): Rule => {
            const [n1 = '', n2 = ''] = s.split('|');
            return [Number.parseInt(n1, 10), Number.parseInt(n2, 10)];
        });

        const allUpdates = splitFilter(updateSection).map(
            (s): Update => parseNumberList(s),
        );

        const validUpdates: Update[] = [];
        const invalidUpdates: Update[] = [];
        allUpdates.forEach((update) => {
            const pageMap = itemToIndexMap(update);
            if (
                rules.every(([n1, n2]) => {
                    const i1 = pageMap.get(n1);
                    const i2 = pageMap.get(n2);
                    return isUndefined(i1) || isUndefined(i2) || i1 < i2;
                })
            ) {
                validUpdates.push(update);
            } else {
                invalidUpdates.push(update);
            }
        });

        return {
            rules,
            allUpdates,
            validUpdates,
            invalidUpdates,
        };
    },
    part1: ({ validUpdates }) => {
        return sum(validUpdates.map(middleItem));
    },
    part2: ({ invalidUpdates, rules }) => {
        const ruleSet = rules.reduce(
            (set, [n1, n2]) => {
                set.add([n1, n2]);
                return set;
            },
            new CustomSet<Rule>({
                getKey: ([n1, n2]) => `${n1},${n2}`,
            }),
        );

        return invalidUpdates.reduce((sum, update) => {
            return (
                sum +
                middleItem(
                    update.sort((a, b) => {
                        if (ruleSet.has([a, b])) {
                            return -1;
                        }
                        if (ruleSet.has([b, a])) {
                            return 1;
                        }
                        return 0;
                    }),
                )
            );
        }, 0);
    },
});
