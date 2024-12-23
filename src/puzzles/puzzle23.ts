import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

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
            computers: [...computers].sort(),
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
                            [computer, connection, connection2]
                                .sort()
                                .join(','),
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
        const networks: string[][] = [];

        let maxNetworkLength = 0;
        let maxNetwork: string[] = [];

        for (const computer of computers) {
            const connected = connections.get(computer)!;
            for (const network of networks) {
                if (network.every((node) => connected.has(node))) {
                    network.push(computer);
                    if (network.length > maxNetworkLength) {
                        maxNetworkLength = network.length;
                        maxNetwork = network;
                    }
                }
            }
            networks.push([computer]);
        }

        return maxNetwork.join(',');
    },
});
