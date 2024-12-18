import { Puzzle } from './Puzzle';
import { DirectionKeys, Grid, GridCoordinate, GridNode } from '~/types/Grid';
import { Stack } from '~/types/Stack';
import { Point, PointSet } from '~/types/Point';

class Node extends GridNode {
    readonly plant: string;

    constructor({
        plant,
        row,
        col,
    }: {
        plant: string;
    } & GridCoordinate) {
        super({ row, col });
        this.plant = plant;
    }

    toString() {
        return this.plant.toString();
    }
}

class Region extends Set<Node> {
    private readonly grid: Grid<Node>;

    constructor({ grid, nodes }: { grid: Grid<Node>; nodes?: Node[] }) {
        super(nodes);
        this.grid = grid;
    }

    /**
     * Paint fill approach to finding the region of nodes that are connected to the given node.
     */
    static fromNode(grid: Grid<Node>, node: Node) {
        const region = new Region({ grid });
        const stack = new Stack<Node>();
        stack.add(node);
        stack.process((node) => {
            region.add(node);
            const neighbors = grid
                .getOrthogonalNeighborsOf(node.row, node.col)
                .filter((n) => n.plant === node.plant);
            neighbors.forEach((neighbor) => {
                if (!region.has(neighbor)) {
                    stack.add(neighbor);
                }
            });
        });
        return region;
    }

    get area() {
        return this.size;
    }

    get perimeter() {
        const counted = new Set<Node>();
        return Array.from(this).reduce((sum, node) => {
            counted.add(node);
            const neighbors = this.grid.getOrthogonalNeighborsOf(
                node.row,
                node.col,
            );
            const neighborsAlreadyCounted = neighbors.filter((neighbor) =>
                counted.has(neighbor),
            );
            return sum + 4 - 2 * neighborsAlreadyCounted.length;
        }, 0);
    }

    get nSides() {
        const pointSet = new PointSet();
        const pointNodeMap = new Map<Point, Set<Node>>();
        this.forEach((node) => {
            const points: Point[] = [new Point(node.col, node.row)];
            [
                DirectionKeys.down,
                DirectionKeys.right,
                DirectionKeys.downRight,
            ].forEach((direction) => {
                const coords = this.grid.getCoordsInDirection(
                    node.row,
                    node.col,
                    direction,
                );
                points.push(new Point(coords.col, coords.row));
            });
            points.forEach((newPoint) => {
                const point = pointSet.getLike(newPoint) ?? newPoint;
                const nodesAtPoint = pointNodeMap.get(point) ?? new Set<Node>();
                nodesAtPoint.add(node);
                pointNodeMap.set(point, nodesAtPoint);
                pointSet.add(point);
            });
        });
        const edgePoints = new PointSet();
        let nCorners = 0;
        pointNodeMap.forEach((nodes, point) => {
            if (nodes.size < 4) {
                edgePoints.add(point);
            }
            if (nodes.size % 2 === 1) {
                nCorners++;
            }
            if (nodes.size === 2) {
                const [n0, n1] = Array.from(nodes) as [Node, Node];
                if (
                    !this.grid
                        .getOrthogonalNeighborsOf(n0.row, n0.col)
                        .some((n) => n === n1)
                ) {
                    nCorners += 2;
                }
            }
        });

        return nCorners;
    }

    get cost() {
        return this.area * this.perimeter;
    }

    get discountedCost() {
        return this.area * this.nSides;
    }
}

export const puzzle12 = new Puzzle({
    day: 12,
    parseInput: (fileData) => {
        const grid = Grid.stringToNodeGrid(
            fileData,
            ({ input, row, col }) =>
                new Node({
                    plant: input,
                    row,
                    col,
                }),
        );

        const nodeRegionMap = new Map<Node, Region>();
        const regions = new Set<Region>();
        const nodesSeen = new Set<Node>();

        grid.forEach((node) => {
            if (!node || nodesSeen.has(node)) return;

            const region = Region.fromNode(grid, node);
            region.forEach((n) => {
                nodeRegionMap.set(n, region);
                nodesSeen.add(n);
            });

            regions.add(region);
        });

        return regions;
    },
    part1: (regions) => {
        return Array.from(regions).reduce((sum, region) => {
            return sum + region.cost;
        }, 0);
    },
    part2: (regions) => {
        return Array.from(regions).reduce((sum, region) => {
            return sum + region.discountedCost;
        }, 0);
    },
});
