// Invokes an "inherent," i.e. instance-bound typeguard.
// E.g., in discord there is an `interaction: Interaction` has an `interaction.isButton()` typeguard.
// We want to be able to call it like `inherently('isButton')(interaction)`.

// import _ from "lodash";

// export function inherently<T, U extends T>(typeguardName: TypeguardKeys<T>): (obj: T) => obj is U {
//   return (obj: T): obj is U => {
//     const typeguard = obj[typeguardName];
//     if ( !typeguard || !_.isFunction(typeguard) ) {
//       throw new Error(`Object does not have inherent typeguard '${String(typeguardName)}'.`);
//     };
//     return typeguard.call(obj);
//   }
// };