import _ from 'lodash';

export default function humanize(str: string): string {
  return _.capitalize(_.startCase(str));
}

export function labelize(values: string[]): {
  value: string;
  label: string;
}[] {
  return values.map(value => ({ value, label: humanize(value) }));
}