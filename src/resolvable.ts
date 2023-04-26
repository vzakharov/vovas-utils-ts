import _ from "lodash";

import { ensure } from "./ensure.js";
import { UnixTimestamp } from "./types.js";

export interface ResolvableConfig<T> {
  previousResolved?: UnixTimestamp;
  startResolved?: boolean;
  startResolvedWith?: T;
  then?: (value: T) => void;
}

export class Resolvable<T = void> {

  id = _.uniqueId('res-');
  inProgress: boolean = true;
  private _resolve: (value?: T | PromiseLike<T>) => void = () => {};
  private _reject: (reason?: any) => void = () => {};
  promise = new Promise<T>((_resolve, _reject) => { Object.assign(this, { _resolve, _reject }); });
  previousResolved: UnixTimestamp | undefined;

  constructor(
    private config: ResolvableConfig<T> = {}
  ) {
    const { previousResolved, startResolved, startResolvedWith, then } = this.config;
    this.previousResolved = previousResolved;
    if ( startResolved ) {
      this.promise = Promise.resolve(ensure(startResolvedWith));
      this.inProgress = false;
    }
    if ( then )
      this.promise.then(then);
  }

  get resolved() {
    return !this.inProgress;
  }

  resolve(value?: T | PromiseLike<T>) {
    // console.log('Resolving');
    this._resolve(value);
    this.inProgress = false;
    this.previousResolved = Date.now();
    // console.log('Resolved:', this);
  }

  reject(reason?: any) {
    this._reject(reason);
    this.inProgress = false;
  }

  reset(value?: T | PromiseLike<T>) {
    this.resolve(value);
    this.start();
  }

  // restart as an alias for reset
  restart(value?: T | PromiseLike<T>) {
    this.reset(value);
  }

  start() {
    if ( this.inProgress )
      throw new Error('Cannot start a Resolvable that is already in progress.');
    Object.assign(this, new Resolvable({
      ...this.config,
      startResolved: false,
    }));
  };

  startIfNotInProgress() {
    if ( !this.inProgress )
      this.start();
  };

  async restartAfterWait() {
    while ( this.inProgress )
      await this.promise;
    this.start();
    // The point: If we have multiple things waiting for the same resolvable, we want to make sure that only one of them actually starts executing once the wait is over.
    // In this case, the first one who responds to the promise will start the resolvable again, and the others will have to wait again.
  };

  static resolvedWith<T>(value: T) {
    return new Resolvable<T>({ startResolved: true, startResolvedWith: value });
  };

}