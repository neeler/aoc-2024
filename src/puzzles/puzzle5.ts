import { Puzzle } from './Puzzle';
import { sum } from '~/util/arithmetic';
import { splitFilter, parseNumberList } from '~/util/parsing';
import { itemToIndexMap, middleItem } from '~/util/collections';

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

        const updateIndexMaps = allUpdates.reduce((map, update) => {
            map.set(update, itemToIndexMap(update));
            return map;
        }, new Map<Update, Map<number, number>>());

        const correctUpdates: Update[] = [];
        const incorrectUpdates: Update[] = [];
        allUpdates.forEach((update) => {
            if (updateIsValid(updateIndexMaps.get(update)!, rules)) {
                correctUpdates.push(update);
            } else {
                incorrectUpdates.push(update);
            }
        });

        return {
            rules,
            allUpdates,
            correctUpdates,
            incorrectUpdates,
            updateIndexMaps,
        };
    },
    part1: ({ correctUpdates }) => {
        return sum(correctUpdates.map(middleItem));
    },
    part2: ({ incorrectUpdates, rules, updateIndexMaps }) => {
        return incorrectUpdates.reduce((sum, update) => {
            const pageMap = updateIndexMaps.get(update)!;
            const relevantRules = rules.filter(([n1, n2]) => {
                return pageMap.has(n1) && pageMap.has(n2);
            });
            return sum + middleItem(buildValidOrdering(relevantRules));
        }, 0);
    },
});

function updateIsValid(pageMap: Map<number, number>, rules: Rule[]) {
    return rules.every(
        ([n1, n2]) =>
            !pageMap.has(n1) ||
            !pageMap.has(n2) ||
            (pageMap.get(n1) ?? 0) < (pageMap.get(n2) ?? 0),
    );
}

function buildValidOrdering(rules: Rule[]) {
    const beforeAfterMap = new Map<number, Set<number>>();
    rules.forEach((rule) => {
        const afterSet = beforeAfterMap.get(rule[0]) ?? new Set();
        afterSet.add(rule[1]);
        beforeAfterMap.set(rule[0], afterSet);
    });

    // Iteratively add all numbers that are after the numbers that are after the numbers that are after...
    for (const afterSet of beforeAfterMap.values()) {
        const queue = Array.from(afterSet);
        while (queue.length) {
            const x = queue.pop()!;
            const afterAfterSet = beforeAfterMap.get(x) ?? new Set();
            for (const y of afterAfterSet) {
                if (!afterSet.has(y)) {
                    afterSet.add(y);
                    queue.push(y);
                }
            }
        }
    }

    // Iteratively build the valid ordering based on the before/after rules
    const validOrdering: Update = [];
    for (const n of new Set(rules.flat())) {
        const numsAfter = beforeAfterMap.get(n);

        if (!numsAfter) {
            validOrdering.push(n);
        } else {
            const minIndex = Math.min(
                ...numsAfter
                    .values()
                    .map((m) => validOrdering.indexOf(m))
                    .filter((i) => i !== -1),
            );
            validOrdering.splice(minIndex, 0, n);
        }
    }

    // Sanity check that the ordering is valid
    if (!updateIsValid(itemToIndexMap(validOrdering), rules)) {
        throw new Error('Invalid ordering');
    }

    return validOrdering;
}
