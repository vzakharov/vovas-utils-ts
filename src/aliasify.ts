import _ from "lodash";
import { Merge } from "./merge";


const testObject = {
  type: "fruit",
  color: "red",
  name: "apple",
} as const;

export type AliasesDefinition<Key extends string = string> = {
  readonly [key in Key]?: readonly string[];
};

const testDefinitions = {
  type: ["kind"],
  color: ["colour"],
} as const;

type TestDefinitions = typeof testDefinitions;

// TS Tooltip:
// type TestDefinitions = {
//   readonly type: readonly ["kind"];
//   readonly color: readonly ["colour"];
// }

type MapToUnion<T> = {
  [key in keyof T]: T[key] extends readonly (infer U)[] ? U : never;
}

type FlattenToPropsUnion<T extends object> = T[keyof T];

type AllPropsUnion<T> = FlattenToPropsUnion<MapToUnion<T>>;

export type AliasedKeys<Definition extends AliasesDefinition> = AllPropsUnion<Definition>;

type TestAliasedKeys = AliasedKeys<TestDefinitions>;

// TS Tooltip:
// type TestAliasedKeys = "kind" | "colour"


type AliasesFor<Object extends Record<string, any>, Aliases extends AliasesDefinition<Object>> = {
  [key in AliasedKeys<Object, Aliases>]: Object[{
    [K in keyof Aliases]: Aliases[K] extends readonly (key & string)[] ? K : never;
  }[key]];
};

let aliases: AliasesFor<typeof testObject, AliasesDefinition<typeof testObject>>; // should give: { kind: "fruit", colour: "red" }


export type Aliasified<Object extends Record<string, any>, Definition extends AliasesDefinition<Object>> = Merge<
  Object,
  AliasesFor<Object, Definition>
>;

export function aliasify<Object extends Record<string, any>, Definition extends AliasesDefinition<Object>>(
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

