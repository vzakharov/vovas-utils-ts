import _ from "lodash";
import { Merge } from "./merge";


const testObject = {
  type: "fruit",
  color: "red",
  name: "apple",
} as const;

export type AliasesDefinition<Key extends keyof any = keyof any> = {
  readonly [key in Key]?: readonly string[] | string
};

const testDefinitions = {
  type: ["kind", "variety"],
  color: "colour",
} as const;

type TestDefinitions = typeof testDefinitions;

// TS Tooltip:
// type TestDefinitions = {
//   readonly type: readonly ["kind"];
//   readonly color: readonly ["colour"];
// }

type MapToUnion<T> = {
  [key in keyof T]: 
    T[key] extends readonly (infer U)[] ?
      U :
      T[key] extends infer U ?
        U :
        never;
};

type TestMapToUnion = MapToUnion<TestDefinitions>;

type FlattenToPropsUnion<T extends object> = T[keyof T];

type AllPropsUnion<T> = FlattenToPropsUnion<MapToUnion<T>>;

export type AliasedKeys<Definition extends AliasesDefinition> = AllPropsUnion<Definition> & string;

type TestAliasedKeys = AliasedKeys<TestDefinitions>;

// TS Tooltip:
// type TestAliasedKeys = "kind" | "colour"

type ReverseKeysValues<T extends Record<string, string>> = {
  [Value in FlattenToPropsUnion<T>]: {
    [Key in keyof T]: Value extends T[Key] ? Key : never;
  }[keyof T];
};

type TestReverseKeysValues = ReverseKeysValues<MapToUnion<TestDefinitions>>;

// TS Tooltip:
// type TestReverseKeysValues = {
//   kind: "type";
//   variety: "type";
//   colour: "color";
// }

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

type TestAliasesFor = AliasesFor<typeof testObject, TestDefinitions>;

// TS Tooltip:
// type TestAliasesFor = {
//   kind: "fruit";
//   variety: "fruit";
//   colour: "red";
// }

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