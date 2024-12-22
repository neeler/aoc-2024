import { Puzzle } from './Puzzle';
import { getMultilineNumbers } from '~/util/parsing';
import { mod } from '~/util/arithmetic';

type Sequence = [number, number, number, number];

export const puzzle22 = new Puzzle({
    day: 22,
    parseInput: (fileData) => {
        return getMultilineNumbers(fileData);
    },
    part1: (secrets) => {
        return secrets.reduce(
            (sum, secret) => sum + nextSecret(secret, 2000),
            0,
        );
    },
    part2: (secrets) => {
        const totalSequencePrices = new Map<string, number>();
        secrets.forEach((initialSecret) => {
            let secret = initialSecret;
            let lastPrice = getPrice(secret);
            const changes: number[] = [];
            const sequencesSeen = new Set<string>();
            for (let i = 0; i < 2000; i++) {
                secret = nextSecret(secret);

                const price = getPrice(secret);
                changes.push(price - lastPrice);

                if (i >= 3) {
                    const key = sequenceKey([
                        changes[i - 3]!,
                        changes[i - 2]!,
                        changes[i - 1]!,
                        changes[i]!,
                    ]);
                    if (!sequencesSeen.has(key)) {
                        sequencesSeen.add(key);
                        totalSequencePrices.set(
                            key,
                            (totalSequencePrices.get(key) ?? 0) + price,
                        );
                    }
                }

                lastPrice = price;
            }
        });

        return Math.max(...totalSequencePrices.values());
    },
});

function sequenceKey(sequence: Sequence) {
    return sequence.join(',');
}

function nextSecret(input: number, iterations = 1) {
    if (iterations === 0) return input;

    let secret = input;

    secret = prune(mix(secret, secret * 64));
    secret = prune(mix(secret, Math.floor(secret / 32)));
    secret = prune(mix(secret, secret * 2048));

    return nextSecret(secret, iterations - 1);
}

function mix(secret: number, n: number) {
    return secret ^ n;
}

function prune(n: number) {
    return mod(n, 16777216);
}

function getPrice(secret: number) {
    const str = secret.toString();
    return Number(str.charAt(str.length - 1));
}
