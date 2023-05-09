export function setReliableTimeout( callback: ( actualTimePassed: number ) => void, timeout: number ): NodeJS.Timeout {

  const startTime = Date.now();
  
  return setTimeout(() => {
    const actualTimePassed = Date.now() - startTime;
    callback(actualTimePassed);
  }, timeout);

}