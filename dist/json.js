;
export function jsonClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
export function jsonEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
