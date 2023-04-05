// A meta function is basically a function that can refer to itself (enabling recursion without creating a named function beforehand).

// Example:
// client.on(Events.InteractionCreate, meta( listener => async ( interaction: Interaction ) => {
//   if ( !interaction.isButton() || interaction.customId !== id ) return;
//   log.green('Button clicked', { id });
//   // TODO: Run actions
//   client.removeListener(Events.InteractionCreate, listener);
// } )

// So the call to `meta` should call the inner function right away while at the same time passing it a reference to itself.

export function meta<Args extends any[], Return>(
  fn: (wrapper: (...args: Args) => Return) => (...args: Args) => Return
) {
  // Create a wrapper function that will pass itself as the first argument to `fn`
  const wrapper = (...args: Args) => {
    // Call the provided function with the wrapper function as the first argument
    const innerFn = fn(wrapper);
    // Invoke the inner function with the arguments and return its result
    return innerFn(...args);
  };

  // Return the wrapper function
  return wrapper;
}