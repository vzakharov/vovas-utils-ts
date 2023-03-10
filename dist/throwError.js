export function throwError(error) {
    throw typeof error === 'string' ? new Error(error) : error;
}
