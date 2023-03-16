import _ from 'lodash';
export function $try(fn, fallback) {
    try {
        return fn();
    }
    catch (e) {
        return _.isFunction(fallback) ? fallback() : fallback;
    }
}
