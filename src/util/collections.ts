export function indexToItemMap<T>(array: T[]) {
    return array.reduce((map, value, index) => {
        map.set(index, value);
        return map;
    }, new Map<number, T>());
}

export function itemToIndexMap<T>(array: T[]) {
    return array.reduce((map, value, index) => {
        map.set(value, index);
        return map;
    }, new Map<T, number>());
}

export function middleItem<T>(array: T[]): T {
    if (!array.length) {
        throw new Error('Array is empty');
    }
    return array[Math.floor(array.length / 2)]!;
}
