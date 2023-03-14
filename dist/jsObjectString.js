// Turns an object into a js-evaluable string.
import _ from 'lodash';
import { isPrimitive } from './types.js';
export function jsObjectString(obj) {
    // Any non-primitive object that is included in the "tree" of the object being stringified more than once is first added to a `shared` array so that it can be referenced by index in the stringified object, so we first need to populate that array.
    const seen = [];
    const shared = [];
    function scanForShared(obj) {
        if (isPrimitive(obj)) {
            return;
        }
        if (seen.includes(obj)) {
            if (!shared.includes(obj)) {
                shared.push(obj);
            }
            return;
        }
        seen.push(obj);
        (_.isArray(obj) ? obj : _.values(obj)).forEach(scanForShared);
    }
    ;
    scanForShared(obj);
    // Now we can stringify the object, using the `shared` array to reference any objects that are included more than once.
    const getIndent = (count) => '  '.repeat(count);
    let indentCount = 0;
    function stringify(obj, disableShared) {
        indentCount++;
        const indent = getIndent(indentCount);
        let value = (() => {
            if (isPrimitive(obj)) {
                return typeof obj === 'string' ? JSON.stringify(obj) : String(obj);
            }
            if (_.isArray(obj)) {
                return `[${obj.map(item => stringify(item, disableShared)).join(', ')}]`;
            }
            if (!disableShared) {
                const sharedIndex = shared.indexOf(obj);
                if (sharedIndex !== -1) {
                    return `shared[${sharedIndex}]`;
                }
            }
            const keys = _.keys(obj);
            if (keys.length === 0) {
                return '{}';
            }
            return `{\n${keys.map(key => `${indent}${key}: ${stringify(obj[key], disableShared)}`).join(',\n')}\n${getIndent(indentCount - 1)}}`;
        })();
        indentCount--;
        return value;
    }
    ;
    return `const shared = ${stringify(shared, true)};\n\nexport default ${stringify(obj)};`;
}
;
