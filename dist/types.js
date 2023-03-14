import _ from "lodash";
export function isPrimitive(v) {
    const result = _.isString(v) || _.isNumber(v) || _.isBoolean(v) || _.isNull(v) || _.isUndefined(v);
    // log(result, "isPrimitive", v);
    return result;
}
;
