import { FixedSizeArray } from '~/types/arrays';

/**
 * Splits a string into an array of strings, filtering out empty strings.
 *
 * @param str The string to split.
 * @param [delimiter='\n'] The delimiter to split the string on.
 */
export function splitFilter(str: string, delimiter = '\n'): string[] {
    return str.split(delimiter).filter((s) => s);
}

/**
 * Splits a string into an array of strings, filtering out empty strings,
 * then parses each string into a number.
 *
 * @param str The string to split.
 * @param [delimiter=',']  The delimiter to split the string on.
 */
export function parseNumberList(str: string, delimiter = ','): number[] {
    return splitFilter(str, delimiter).map(Number);
}

/**
 * Get numbers from a string, including negative numbers.
 */
export function getNumbers(str: string): number[] {
    return str.match(/-?\d+/g)?.map(Number) ?? [];
}

/**
 * Get numbers from a string, including negative numbers.
 * Throw an error if the number of numbers found does not match the expected count.
 */
export function getNumbersAssert<L extends number>(
    str: string,
    count: number,
): FixedSizeArray<number, L> {
    const numbers = getNumbers(str);
    if (numbers.length !== count) {
        throw new Error(`Expected ${count} numbers, found ${numbers.length}`);
    }
    return numbers as FixedSizeArray<number, L>;
}
