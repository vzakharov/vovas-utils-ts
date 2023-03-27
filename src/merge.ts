import _ from 'lodash';

export type Merge<Target extends object | ( (...args: any[]) => any ), Source extends object> = {
  [K in keyof Target | keyof Source]: 
    K extends keyof Target
      ? K extends keyof Source
        ? Target[K] extends object
          ? Source[K] extends object
            ? Merge<Target[K], Source[K]>
            : never
          : never
        : Target[K]
      : K extends keyof Source
        ? Source[K]
        : never;
} & ( 
  Target extends ( (...args: infer Args) => infer Returns ) 
    ? ( ...args: Args ) => Returns 
    : {} 
);

export function merge<Target extends object, Source extends object>( 
  target: Target, 
  getSource: (target: Target) => Source 
): Merge<Target, Source>;

export function merge<Target extends object, Source extends object>( target: Target, source: Source ): 
  Merge<Target, Source>;

export function merge<Target extends object, Source1 extends object, Source2 extends object>( 
  target: Target, 
  getSource1: (target: Target) => Source1,
  getSource2: (mergedTarget: Merge<Target, Source1>) => Source2
): Merge<Merge<Target, Source1>, Source2>;  
  
export function merge<Target extends object, Source1 extends object, Source2 extends object>( 
  target: Target,
  source1: Source1,
  source2: Source2 
): Merge<Merge<Target, Source1>, Source2>;

export function merge<Target, Sources extends ( object | ((target: Target) => object) )[]>(
  target: Target,
  ...sources: Sources
) {
  let result = target;
  for ( const source of sources ) {
    if ( _.isFunction(source) ) {
      result = _.merge( result, source(result) );
    } else {
      result = _.merge( result, source );
      // Note that lodash allows merging non-objects, so that they are overwritten. We prevent this at compile time, but not at runtime.
    }
  }
  return result;
}

// // Tests:
// const a = { a: 1, b: { c: 3 }, d: 4 };
// const b = { b: { d: 4 }, d: 5 };
// const c = { c: 6 };
// const d = merge( a, b, c );
// d.a; // number
// d.b; // { c: number, d: number }
// d.c; // number
// d.d; // never (can't merge non-objects)

// const it = merge({
//   dog: 1,
//   cat: 2,
//   bird: 3,
// }, animal => ({
//   a: animal,
//   the: animal,
//   that: animal,
// }), someAnimal => ({
//   is: someAnimal,
//   was: someAnimal,
//   aint: someAnimal,
// }));

// it.is.a.dog; // ok
// it.the.cat; // also ok
// it.bird; // also ok

// const mergedFunction = merge(
//   (a: number, b: string) => a + b,
//   { hello: 'world' },
// );

// mergedFunction(1, '2'); // ok
// mergedFunction.hello; // ok