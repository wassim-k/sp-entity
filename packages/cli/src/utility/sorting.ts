export function sortPaths(a: string, b: string): number {
    if (a.startsWith('.') && !b.startsWith('.')) {
        return 1;
    } else if (b.startsWith('.') && !a.startsWith('.')) {
        return -1;
    } else {
        return a.localeCompare(b);
    }
}

export function sortCaseInsensitive(a: string, b: string): number {
    return a.localeCompare(b, 'en', { sensitivity: 'base' });
}
