import { Puzzle } from './Puzzle';
import { parseNumberList } from '~/util/parsing';
import { sum } from '~/util/arithmetic';

type Operator = '+' | '*' | '||';
interface Equation {
    testValue: number;
    numbers: number[];
}

export const puzzle7 = new Puzzle({
    day: 7,
    parseInput: (fileData) => {
        return fileData
            .split('\n')
            .filter((s) => s)
            .map((s): Equation => {
                const [testValue = '', numbers = ''] = s.split(':');
                return {
                    testValue: Number(testValue),
                    numbers: parseNumberList(numbers.trim(), ' '),
                };
            });
    },
    part1: (equations) => {
        return sumValidEquations(equations, ['+', '*']);
    },
    part2: (equations) => {
        return sumValidEquations(equations, ['+', '*', '||']);
    },
});

function sumValidEquations(equations: Equation[], operators: Operator[]) {
    return sum(
        equations
            .filter((equation) => equationIsValid(equation, operators))
            .map((eq) => eq.testValue),
    );
}

function equationIsValid(equation: Equation, operators: Operator[]) {
    const { testValue, numbers } = equation;
    let possibleValues: number[] = [numbers[0]!];
    for (let i = 1; i < numbers.length; i++) {
        let nextValues: number[] = [];
        const nextNumber = numbers[i]!;
        for (const operator of operators) {
            for (const val of possibleValues) {
                const result = operate(operator, val, nextNumber);
                if (result <= testValue) {
                    nextValues.push(result);
                }
            }
        }
        possibleValues = nextValues;
    }
    return possibleValues.includes(testValue);
}

function operate(operator: Operator, a: number, b: number): number {
    switch (operator) {
        case '+':
            return a + b;
        case '*':
            return a * b;
        case '||':
            return Number(`${a}${b}`);
    }
}
