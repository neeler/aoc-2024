import { Puzzle } from './Puzzle';
import { splitFilter } from '~/util/parsing';

class Machine {
    readonly ax: number;
    readonly ay: number;
    readonly bx: number;
    readonly by: number;
    readonly prizeX: number;
    readonly prizeY: number;

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
        return splitFilter(fileData, '\n\n').map((machine) => {
            const [
                ,
                ax = '',
                ay = '',
                bx = '',
                by = '',
                prizeX = '',
                prizeY = '',
            ] =
                machine.match(
                    /Button A: X\+(\d+), Y\+(\d+)\s+Button B: X\+(\d+), Y\+(\d+)\s+Prize: X=(\d+), Y=(\d+)/,
                ) ?? [];
            return new Machine({
                ax: parseInt(ax, 10),
                ay: parseInt(ay, 10),
                bx: parseInt(bx, 10),
                by: parseInt(by, 10),
                prizeX: parseInt(prizeX, 10),
                prizeY: parseInt(prizeY, 10),
            });
        });
    },
    part1: (machines) => {
        return machines.reduce(
            (acc, machine) => acc + (machine.winCost ?? 0),
            0,
        );
    },
    part2: (machines) => {
        return machines.reduce(
            (acc, inputMachine) =>
                acc +
                (new Machine({
                    ax: inputMachine.ax,
                    ay: inputMachine.ay,
                    bx: inputMachine.bx,
                    by: inputMachine.by,
                    prizeX: inputMachine.prizeX + 10000000000000,
                    prizeY: inputMachine.prizeY + 10000000000000,
                }).winCost ?? 0),
            0,
        );
    },
});
