import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { Queue } from '~/types/Queue';

export const puzzle23 = new Puzzle({
    day: 23,
    parseInput: (fileData) => {
        const connectionPairs = splitFilter(fileData).map(
            (line) => line.split('-') as [string, string],
        );
        const computers = new Set<string>();
        const connections = new Map<string, Set<string>>();
        connectionPairs.forEach(([a, b]) => {
            computers.add(a);
            computers.add(b);
            const connectionsA = connections.get(a) ?? new Set<string>();
            const connectionsB = connections.get(b) ?? new Set<string>();
            connectionsA.add(b);
            connectionsB.add(a);
            connections.set(a, connectionsA);
            connections.set(b, connectionsB);
        });
        return {
            connections,
            computers,
        };
    },
    part1: ({ connections, computers }) => {
        const trios = new Set<string>();
        for (const computer of computers) {
            const connectionsToComputer = connections.get(computer);
            if (!connectionsToComputer) {
                continue;
            }
            for (const connection of connectionsToComputer) {
                const connectionsToConnection = connections.get(connection)!;
                for (const connection2 of connectionsToConnection) {
                    if (connection2 === computer) {
                        continue;
                    }
                    if (connectionsToComputer.has(connection2)) {
                        trios.add(
                            graphKey([computer, connection, connection2]),
                        );
                    }
                }
            }
        }
        return [
            ...trios
                .keys()
                .filter((key) => key.startsWith('t') || key.includes(',t')),
        ].length;
    },
    part2: ({ connections, computers }) => {
        const queue = new Queue<{
            key: string;
            complete: Set<string>;
            remaining: Set<string>;
        }>();
        for (const computer of computers) {
            queue.add({
                key: computer,
                complete: new Set([computer]),
                remaining: connections.get(computer)!,
            });
        }

        const completesSeen = new Set<string>();
        let maxLength = 0;
        let maxKey = '';

        queue.process(({ key, complete, remaining }) => {
            if (remaining.size === 0) {
                if (key.length > maxLength) {
                    maxLength = key.length;
                    maxKey = key;
                }
                return;
            }

            for (const node of remaining) {
                const nextComplete = new Set(complete);
                nextComplete.add(node);

                const nextKey = graphKey(nextComplete);
                if (completesSeen.has(nextKey)) {
                    continue;
                }

                completesSeen.add(nextKey);

                const nextRemaining = new Set<string>();
                for (const n of connections.get(node)!) {
                    if (remaining.has(n)) {
                        nextRemaining.add(n);
                    }
                }

                queue.add({
                    key: nextKey,
                    complete: nextComplete,
                    remaining: nextRemaining,
                });
            }
        });

        return maxKey;
    },
});

/**
 * Generate a key for a graph.
 */
function graphKey(nodes: string[] | Set<string>) {
    if (nodes instanceof Set) {
        nodes = [...nodes];
    }
    return nodes.sort().join(',');
}
