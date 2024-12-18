import { Puzzle } from './Puzzle';
import { getNumbersForEachLine, splitFilter } from '~/util/parsing';

class Machine {
    readonly ax: number;
    readonly ay: number;
    readonly bx: number;
    readonly by: number;
    prizeX: number;
    prizeY: number;

    constructor({
        ax,
        ay,
        bx,
        by,
        prizeX,
        prizeY,
    }: {
        ax: number;
        ay: number;
        bx: number;
        by: number;
        prizeX: number;
        prizeY: number;
    }) {
        this.ax = ax;
        this.ay = ay;
        this.bx = bx;
        this.by = by;
        this.prizeX = prizeX;
        this.prizeY = prizeY;
    }

    static fromString(str: string) {
        const [[ax, ay] = [], [bx, by] = [], [prizeX, prizeY] = []] =
            getNumbersForEachLine(str);
        if (
            ax === undefined ||
            ay === undefined ||
            bx === undefined ||
            by === undefined ||
            prizeX === undefined ||
            prizeY === undefined
        ) {
            throw new Error('Invalid input');
        }
        return new Machine({
            ax,
            ay,
            bx,
            by,
            prizeX,
            prizeY,
        });
    }

    get winCost() {
        // X = a * Ax + b * Bx
        // Y = a * Ay + b * By

        // a = (X - b * Bx) / Ax
        // Y = (X - b * Bx) * Ay / Ax + b * By
        // Y = X * Ay / Ax - b * Bx * Ay / Ax + b * By
        // Y = X * Ay / Ax + b * (By - Bx * Ay / Ax)
        // b * (By - Bx * Ay / Ax) = Y - X * Ay / Ax
        // b = (Y - X * Ay / Ax) / (By - Bx * Ay / Ax)

        const iB = Math.round(
            (this.prizeY - (this.prizeX * this.ay) / this.ax) /
                (this.by - (this.bx * this.ay) / this.ax),
        );

        if (iB < 0) {
            return null;
        }

        const xRem = this.prizeX - iB * this.bx;
        const iA = xRem / this.ax;
        const y = iA * this.ay + iB * this.by;

        if (iA < 0 || iA % 1 !== 0 || y !== this.prizeY) {
            return null;
        }

        return iA * 3 + iB;
    }
}

export const puzzle13 = new Puzzle({
    day: 13,
    parseInput: (fileData) => {
        return splitFilter(fileData, '\n\n').map((s) => Machine.fromString(s));
    },
    part1: (machines) => {
        return machines.reduce(
            (acc, machine) => acc + (machine.winCost ?? 0),
            0,
        );
    },
    part2: (machines) => {
        return machines.reduce((acc, machine) => {
            machine.prizeX += 10000000000000;
            machine.prizeY += 10000000000000;
            return acc + (machine.winCost ?? 0);
        }, 0);
    },
});
