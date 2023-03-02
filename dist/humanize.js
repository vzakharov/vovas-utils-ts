import _ from 'lodash';
export function humanize(str) {
    return _.capitalize(_.startCase(str));
}
export function labelize(values) {
    return values.map(value => ({ value, label: humanize(value) }));
}
