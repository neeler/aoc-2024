import { Puzzle } from './Puzzle';
import { Maze, MazeNode } from '~/types/Maze';

export const puzzle20 = new Puzzle({
    day: 20,
    parseInput: (fileData, { example }) => {
        const maze = Maze.fromMazeString(fileData);
        const start = maze.find((node) => node?.char === 'S')!;
        const end = maze.find((node) => node?.char === 'E')!;
        return {
            maze,
            start: start!,
            end: end!,
            isExample: example,
        };
    },
    part1: ({ maze, start, end, isExample }) => {
        const timeSavedPerCheat = getTimeSavedPerCheat({
            maze,
            start,
            end,
            maxCheatLength: 2,
            minTimeSaved: isExample ? 1 : 100,
        });

        return timeSavedPerCheat.size;
    },
    part2: ({ maze, start, end, isExample }) => {
        const timeSavedPerCheat = getTimeSavedPerCheat({
            maze,
            start,
            end,
            maxCheatLength: 20,
            minTimeSaved: isExample ? 1 : 100,
        });

        return timeSavedPerCheat.size;
    },
});

function getTimeSavedPerCheat({
    maze,
    start,
    end,
    maxCheatLength,
    minTimeSaved,
}: {
    maze: Maze;
    start: MazeNode;
    end: MazeNode;
    maxCheatLength: number;
    minTimeSaved: number;
}) {
    if (maxCheatLength < 2) {
        throw new Error('Cheat must be at least 2');
    }

    const originalTime = maze.score({
        start,
        end,
    });

    const distancesToEnd = new Map<MazeNode, number>();
    distancesToEnd.set(start, originalTime);
    distancesToEnd.set(end, 0);

    const timeSavedPerCheat = new Map<string, number>();

    maze.forEach((jumpStart) => {
        if (!jumpStart || jumpStart.obstacle) {
            return;
        }

        const timeToJump = maze.score({
            start,
            end: jumpStart,
        });
        if (timeToJump === Infinity || jumpStart === end) {
            return;
        }

        for (
            let jumpDistance = 2;
            jumpDistance < maxCheatLength + 1;
            jumpDistance++
        ) {
            if (timeToJump + jumpDistance >= originalTime) {
                continue;
            }

            const jumpEnds = maze.getNAway(
                jumpStart,
                jumpDistance,
                (n) => !n.obstacle,
            );

            for (const jumpEnd of jumpEnds) {
                const timeToEnd =
                    distancesToEnd.get(jumpEnd) ??
                    maze.score({
                        start: jumpEnd,
                        end,
                    });
                distancesToEnd.set(jumpEnd, timeToEnd);

                const newTime = timeToJump + jumpDistance + timeToEnd;
                const timeSaved = originalTime - newTime;

                if (timeSaved >= minTimeSaved) {
                    const key = [
                        jumpStart.row,
                        jumpStart.col,
                        jumpEnd.row,
                        jumpEnd.col,
                    ].join(',');

                    timeSavedPerCheat.set(
                        key,
                        Math.max(timeSavedPerCheat.get(key) ?? 0, timeSaved),
                    );
                }
            }
        }
    });

    return timeSavedPerCheat;
}
