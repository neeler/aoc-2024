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
