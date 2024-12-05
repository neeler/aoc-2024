export function parseIntList(fileData: string, delimiter = ','): number[] {
    return fileData
        .split(delimiter)
        .filter((s) => s)
        .map((s) => Number.parseInt(s, 10));
}

export function splitFilter(fileData: string, delimiter = '\n'): string[] {
    return fileData.split(delimiter).filter((s) => s);
}
