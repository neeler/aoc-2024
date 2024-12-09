import { Puzzle } from './Puzzle';
import { parseNumberList, splitFilter } from '~/util/parsing';
import { sum } from '~/util/arithmetic';

interface DiskChunk {
    id: string;
    length: number;
}

export const puzzle9 = new Puzzle({
    day: 9,
    parseInput: (fileData) => {
        const input = splitFilter(fileData).map((s) =>
            parseNumberList(s, ''),
        )[0]!;
        const diskData: string[] = [];
        const diskChunks: DiskChunk[] = [];
        let id = 0;
        let i = 0;
        while (i < input.length) {
            const fileLength = input[i]!;
            const spaceAfter = input[i + 1] ?? 0;
            diskData.push(...Array<string>(fileLength).fill(id.toString()));
            diskChunks.push({ id: id.toString(), length: fileLength });

            if (spaceAfter) {
                diskData.push(...Array<string>(spaceAfter).fill('.'));
                diskChunks.push({ id: '.', length: spaceAfter });
            }

            id++;
            i += 2;
        }
        return {
            diskData,
            diskChunks,
        };
    },
    part1: ({ diskData: inputDiskData }) => {
        const diskData = inputDiskData.slice();

        const emptyIndexes: number[] = [];
        const nonEmptyIndexes: number[] = [];

        for (let i = 0; i < diskData.length; i++) {
            const charAt = diskData[i]!;
            if (charAt === '.') {
                emptyIndexes.push(i);
            } else {
                nonEmptyIndexes.push(i);
            }
        }

        let nextEmpty = emptyIndexes.shift();
        let lastNonEmpty = nonEmptyIndexes.pop();

        for (let i = diskData.length - 1; i >= 0; i--) {
            const charAt = diskData[i];
            if (charAt && charAt !== '.') {
                diskData[i] = '.';
                diskData[nextEmpty!] = charAt;

                nextEmpty = emptyIndexes.shift();
                lastNonEmpty = nonEmptyIndexes.pop();

                if (nextEmpty! > lastNonEmpty!) {
                    break;
                }
            }
        }

        return checksum(diskData);
    },
    part2: ({ diskChunks: inputDiskChunks }) => {
        const diskChunks = inputDiskChunks.slice();
        const filesInReverseOrder = diskChunks
            .filter(({ id }) => id !== '.')
            .reverse();

        let iChunk = 0;
        while (iChunk < diskChunks.length && filesInReverseOrder.length) {
            const chunk = diskChunks[iChunk];
            if (!chunk) break;

            if (chunk.id !== '.') {
                iChunk++;
                continue;
            }

            const fileThatFitsIndex = filesInReverseOrder.findIndex(
                ({ length }) => length <= chunk.length,
            );

            if (fileThatFitsIndex !== -1) {
                const fileThatFits = filesInReverseOrder[fileThatFitsIndex]!;

                filesInReverseOrder.splice(fileThatFitsIndex, 1);
                if (fileThatFits.length < chunk.length) {
                    diskChunks.splice(iChunk, 0, fileThatFits);
                    chunk.length = chunk.length - fileThatFits.length;
                } else {
                    diskChunks.splice(iChunk, 1, fileThatFits);
                }

                for (let i = diskChunks.length - 1; i >= 0; i--) {
                    const chunkToRemove = diskChunks[i]!;
                    if (chunkToRemove === fileThatFits) {
                        diskChunks[i] = {
                            id: '.',
                            length: chunkToRemove.length,
                        };
                        break;
                    }
                }
            }

            iChunk++;
        }

        return chunkChecksum(diskChunks);
    },
});

function checksum(diskData: string[]) {
    return diskData.reduce((acc, c, i) => {
        return acc + (c === '.' ? 0 : Number(c)) * i;
    }, 0);
}

function chunkChecksum(chunks: DiskChunk[]) {
    let checksum = 0;
    let iBlock = 0;
    chunks.forEach((chunk) => {
        if (chunk.id !== '.') {
            const fileId = Number(chunk.id);
            checksum += sum(
                Array.from(
                    { length: chunk.length },
                    (_, i) => fileId * (i + iBlock),
                ),
            );
        }
        iBlock += chunk.length;
    });
    return checksum;
}
