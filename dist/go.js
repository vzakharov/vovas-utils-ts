export function go(callback, arg) {
    const recurse = (arg) => go(callback, arg);
    return callback(recurse, arg);
}
export function goer(callback) {
    return (arg) => go(callback, arg);
}
// Examples:
function examples() {
    // 1. Function to calculate the factorial with `goer`:
    const getFactorial = goer((recurse, n) => n === 0 ? 1 : n * recurse(n - 1));
    console.log(getFactorial(5));
    // 2. Retry connecting to an endpoint five times with `go`:
    go((retry, retriesLeft) => {
        try {
            return fetch("https://example.com");
        }
        catch (e) {
            if (retriesLeft > 0)
                return retry(retriesLeft - 1);
            else
                throw e;
        }
    }, 5).then(console.log);
}
