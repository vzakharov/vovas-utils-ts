export function ifGeneric<T, G, U, V>(
  value: T,
  typeguard: (value: T) => value is T & G,
  ifTrue: (value: G) => U,
  ifFalse: (value: Exclude<T, G>) => V
) { 
  return (
    typeguard(value) ? ifTrue(value) : ifFalse(value as Exclude<T, G>)
  ) as T extends G ? U : V; 
};

// Example

function isString<T>(value: T): value is T & string {
  return typeof value === 'string';
};

function stringNumberDial<T extends string | number>(
  value: T,
) {
  return ifGeneric<T, string, number, string>(value, isString, (value) => parseInt(value), (value) => value.toString());
};
// Return type: T extends string ? number : string

stringNumberDial('1') + 1 // OK
stringNumberDial(1).toUpperCase() // OK

// For comparison, without "ifGeneric"

function vanillaDial(value: string | number) {
  if (typeof value === 'string') {
    return parseInt(value);
  } else {
    return value.toString();
  };
}
// Return type: string | number

vanillaDial('1') + 1 // Error: Operator '+' cannot be applied to types 'string | number' and 'number'
vanillaDial(1).toUpperCase() // Error: Property 'toUpperCase' does not exist on type 'string | number'