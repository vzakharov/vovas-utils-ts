import { assign } from "../assign";

export type ChainableKeys<
  Function extends (...args: any[]) => any,
  ChainedParameterIndex extends number,
> = ( keyof NonNullable<Parameters<Function>[ChainedParameterIndex]> );

export type ChainableTypes<
  Function extends (...args: any[]) => any,
  ChainedParameterIndex extends number,
  ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[],
> = Pick<
  NonNullable<Parameters<Function>[ChainedParameterIndex]>,
  ChainedKeys[number]
>;

export type Chainified<
  Function extends (...args: any[]) => any,
  ChainedParameterIndex extends number,
  ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[],
> = {
  [ Key in ChainedKeys[number] ]: 
    ( value: ChainableTypes<Function, ChainedParameterIndex, [Key]>[Key] ) =>
      ( (...args: Parameters<Function>) => ReturnType<Function> )
      & Chainified<Function, ChainedParameterIndex, Exclude<ChainedKeys, Key>>;
};    

export function chainified<
  Function extends (...args: any[]) => any,
  ChainedParameterIndex extends number,
  ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[],
>(
  $function: Function,
  chainedParameterIndex: ChainedParameterIndex,
  chainedKeys: ChainedKeys,
): Chainified<Function, ChainedParameterIndex, ChainedKeys>


export function chainified<
  Function extends (...args: any[]) => any,
  ChainedKeys extends ChainableKeys<Function, ChainedParameterIndex>[],
  ChainedParameterIndex extends number,
>(
  $function: Function,
  chainedParameterIndex: ChainedParameterIndex,
  chainedKeys: ChainedKeys,
): Chainified<Function, ChainedParameterIndex, ChainedKeys>
{
  return chainedKeys.reduce<Chainified<Function, ChainedParameterIndex, ChainedKeys>>(
    ( output, key, index, keys ) => {
      output[key] = value =>
        //
        assign(
          (...args: Parameters<Function>) =>
            $function(
              ...args.slice(0, chainedParameterIndex),
              {
                ...args[chainedParameterIndex],
                [key]: value,
              },
              ...args.slice(chainedParameterIndex + 1),
            ),
          chainified(
            $function,
            chainedParameterIndex,
            keys.splice(index, 1),
          ),
        );
      
      return output;
    },
    {} as any,
  )
};

// Tests:
// export const fetchWith = chainified(fetch, 1, ['method', 'headers', 'body']);

// export const get = fetchWith.method('get');
// // await get('https://example.com');

// export const post = fetchWith.method('post');
// // await post('https://example.com', { body: 'Hello World' });

// export const postJson = ( body: Jsonable ) =>
//   post.headers({ 'Content-Type': 'application/json' }).body(JSON.stringify(body));
// // await postJson({ hello: 'world' })( 'https://example.com' );

// export const authorizedFetch = ( Authorization: string ) => fetchWith.headers({ Authorization });
// // await authorizedFetch('Bearer 12345')('https://example.com');