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
