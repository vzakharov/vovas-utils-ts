import _ from "lodash";
import { Merge } from "./merge";

export type AliasesDefinition<Key extends keyof any = keyof any> = {
  readonly [key in Key]?: readonly string[] | string
};

type MapToUnion<T> = {
  [key in keyof T]: 
    T[key] extends readonly (infer U)[] ?
      U :
      T[key] extends infer U ?
        U :
        never;
};

type FlattenToPropsUnion<T extends object> = T[keyof T];

type AllPropsUnion<T> = FlattenToPropsUnion<MapToUnion<T>>;

export type AliasedKeys<Definition extends AliasesDefinition> = AllPropsUnion<Definition> & string;

type ReverseKeysValues<T extends Record<string, string>> = {
  [Value in FlattenToPropsUnion<T>]: {
    [Key in keyof T]: Value extends T[Key] ? Key : never;
  }[keyof T];
};

type AliasesFor<Object extends Record<string, any>, Definition extends AliasesDefinition<keyof Object>> = {
  [key in AliasedKeys<Definition>]: 
    MapToUnion<Definition> extends Record<string, string> ?
      key extends keyof ReverseKeysValues<MapToUnion<Definition>> ?
        ReverseKeysValues<MapToUnion<Definition>>[key] extends keyof Object ?
          Object[ReverseKeysValues<MapToUnion<Definition>>[key]] :
          never
        : never
      : never
};

export type Aliasified<Object extends Record<string, any>, Definition extends AliasesDefinition<keyof Object>> = Merge<
  Object,
  AliasesFor<Object, Definition>
>;

type TestAliasified = Aliasified<typeof testObject, TestDefinitions>;

// TS Tooltip:
// type TestAliasified = {
//   type: "fruit";
//   color: "red";
//   name: "apple";
//   kind: "fruit";
//   variety: "fruit";
//   colour: "red";
// }

export function aliasify<Object extends Record<string, any>, Definition extends AliasesDefinition<keyof Object>>(
  object: Object,
  aliasesDefinition: Definition,
) {
  // Go through every key of the aliases definition and add these keys to the object, with respective values from the original object
  const retypedObject = object as Aliasified<Object, Definition>;
  for ( const key in aliasesDefinition ) {
    const aliases = aliasesDefinition[key];
    if ( !aliases ) continue;
    for ( const alias of aliases ) {
      retypedObject[alias as keyof Aliasified<Object, Definition>] = object[key];
    }
  };
  return retypedObject;
};

const testAliasified = aliasify({
  type: "fruit",
  color: 0x00ff00,
  isFruit: true,
} as const, {
  type: ["kind", "variety"],
  color: "colour",
} as const);