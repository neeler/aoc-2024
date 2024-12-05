export function parseNumberList(fileData: string, delimiter = ','): number[] {
    return fileData
        .split(delimiter)
        .filter((s) => s)
        .map(Number);
}

export function splitFilter(fileData: string, delimiter = '\n'): string[] {
    return fileData.split(delimiter).filter((s) => s);
}
