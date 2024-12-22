import { Puzzle } from './Puzzle';
import { Maze, MazeNode } from '~/types/Maze';
import { Grid } from '~/types/Grid';

export const puzzle20 = new Puzzle({
    day: 20,
    parseInput: (fileData, { example }) => {
        const { maze, start, end } = Maze.fromMazeString(fileData);
        if (!start || !end) {
            throw new Error('No start or end found');
        }
        const path = getPath({
            maze,
            start,
            end,
        });
        return {
            path,
            isExample: example,
        };
    },
    part1: ({ path, isExample }) => {
        const timeSavedPerCheat = getTimeSavedPerCheat({
            path,
            maxCheatLength: 2,
            minTimeSaved: isExample ? 1 : 100,
        });

        return timeSavedPerCheat.size;
    },
    part2: ({ path, isExample }) => {
        const timeSavedPerCheat = getTimeSavedPerCheat({
            path,
            maxCheatLength: 20,
            minTimeSaved: isExample ? 1 : 100,
        });

        return timeSavedPerCheat.size;
    },
});

/**
 * Get the path from start to end in the maze in order to narrow our search space.
 * The input only has a single path from start to end.
 */
function getPath({
    maze,
    start,
    end,
}: {
    maze: Maze;
    start: MazeNode;
    end: MazeNode;
}) {
    const path: MazeNode[] = [start];
    const nodesSeen = new Set<MazeNode>();
    nodesSeen.add(start);

    let node = start;
    while (node !== end) {
        const neighbors = maze.getOrthogonalNeighborsOf(node.row, node.col);
        const nextNode = neighbors.find((neighbor) => {
            return !neighbor.obstacle && !nodesSeen.has(neighbor);
        });
        if (!nextNode) {
            throw new Error('No path found');
        }
        path.push(nextNode);
        nodesSeen.add(nextNode);
        node = nextNode;
    }

    return path;
}

function getTimeSavedPerCheat({
    path,
    maxCheatLength,
    minTimeSaved,
}: {
    path: MazeNode[];
    maxCheatLength: number;
    minTimeSaved: number;
}) {
    if (maxCheatLength < 2) {
        throw new Error('Cheat must be at least 2');
    }

    const originalTime = path.length;
    const timeToBeat = originalTime - minTimeSaved;

    const timeSavedPerCheat = new Map<string, number>();

    path.forEach((jumpStart, timeToJump) => {
        for (
            let iJumpEnd = timeToJump + minTimeSaved;
            iJumpEnd < path.length;
            iJumpEnd++
        ) {
            const jumpEnd = path[iJumpEnd]!;
            const jumpDistance = Grid.manhattanDistance(jumpStart, jumpEnd);
            const timeToEnd = path.length - 1 - iJumpEnd;

            const newTime = timeToJump + jumpDistance + timeToEnd;

            if (
                jumpEnd === jumpStart ||
                jumpDistance < 2 ||
                jumpDistance > maxCheatLength ||
                newTime > timeToBeat
            ) {
                continue;
            }

            const key = [
                jumpStart.row,
                jumpStart.col,
                jumpEnd.row,
                jumpEnd.col,
            ].join(',');

            timeSavedPerCheat.set(key, originalTime - newTime);
        }
    });

    return timeSavedPerCheat;
}
