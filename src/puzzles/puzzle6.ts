import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';
import { Direction, DirectionKeys, Grid, GridPosSet } from '~/types/Grid';
import { CustomSet } from '~/types/CustomSet';

const rightTurnMap = {
    [DirectionKeys.up]: DirectionKeys.right,
    [DirectionKeys.right]: DirectionKeys.down,
    [DirectionKeys.down]: DirectionKeys.left,
    [DirectionKeys.left]: DirectionKeys.up,
};

export const puzzle6 = new Puzzle({
    day: 6,
    parseInput: (fileData) => {
        const data = splitFilter(fileData).map((line) => splitFilter(line, ''));
        return new Grid({
            maxX: data[0]!.length - 1,
            maxY: data.length - 1,
            defaultValue: (row, col) => data[row]![col]!,
        });
    },
    part1: (grid) => {
        const guardPath = walkGrid(grid);
        return guardPath.size();
    },
    part2: (grid) => {
        let obstaclePositions = 0;

        const obstacles = findObstacles(grid);

        /**
         * Try placing an obstacle at each node along the guard's path
         */
        walkGrid(grid, { obstacles })
            .values()
            .slice(1) // Skip the starting position, can't put an obstacle there
            .forEach(({ row: obstRow, col: obstCol }) => {
                grid.setAt(obstRow, obstCol, '#');
                obstacles.add({ row: obstRow, col: obstCol });

                try {
                    walkGrid(grid, { obstacles });
                } catch {
                    // Loop detected
                    obstaclePositions++;
                }

                grid.setAt(obstRow, obstCol, '.');
                obstacles.delete({ row: obstRow, col: obstCol });
            });

        return obstaclePositions;
    },
});

function findGuard(grid: Grid<string>) {
    return grid.findCoords((char) => char === drawDirection(DirectionKeys.up))!;
}

function findObstacles(grid: Grid<string>) {
    const obstacles = new GridPosSet();
    grid.forEach((char, row, col) => {
        if (char === '#') {
            obstacles.add({ row, col });
        }
    });
    return obstacles;
}

function walkGrid(
    grid: Grid<string>,
    {
        obstacles: inputObstacles,
    }: {
        obstacles?: CustomSet<{ row: number; col: number }>;
    } = {},
) {
    const { row: startingRow, col: startingCol } = findGuard(grid);
    let row = startingRow;
    let col = startingCol;
    let direction = DirectionKeys.up;

    const resetGrid = () => {
        grid.setAt(row, col, '.');
        grid.setAt(startingRow, startingCol, drawDirection(DirectionKeys.up));
    };

    const obstacles = inputObstacles ?? findObstacles(grid);

    const positions = new GridPosSet();
    const directionalPositions = new CustomSet<{
        row: number;
        col: number;
        direction: Direction;
    }>({
        getKey: ({ row, col, direction }) => `${row},${col},${direction}`,
    });
    positions.add({ row, col });
    directionalPositions.add({ row, col, direction });

    while (true) {
        const nextNode = grid.getCoordsInDirection(row, col, direction);

        if (!grid.get(nextNode)) {
            // Reached the end of the grid
            break;
        }

        if (obstacles.has(nextNode)) {
            // Turn right
            direction = rightTurnMap[direction]!;
            grid.setAt(row, col, drawDirection(direction));
        } else {
            // Move forward
            grid.setAt(nextNode.row, nextNode.col, drawDirection(direction));
            grid.setAt(row, col, '.');

            row = nextNode.row;
            col = nextNode.col;

            positions.add(nextNode);
        }

        if (directionalPositions.has({ row, col, direction })) {
            // We've seen this position before, so it's a loop
            resetGrid();

            throw new Error('Loop detected');
        }

        directionalPositions.add({ row, col, direction });
    }

    resetGrid();

    return positions;
}

function drawDirection(direction: Direction) {
    return (
        {
            [DirectionKeys.up]: '^',
            [DirectionKeys.down]: 'v',
            [DirectionKeys.left]: '<',
            [DirectionKeys.right]: '>',
        }[direction] ?? 'X'
    );
}
