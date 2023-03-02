import { ensureProperty } from "./ensure.js";
export default function doWith(target, callback, { finally: cleanMethodName }) {
    try {
        return callback(target);
    }
    finally {
        ensureProperty(target, cleanMethodName)();
    }
}
