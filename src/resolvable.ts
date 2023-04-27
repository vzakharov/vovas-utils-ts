import _ from "lodash";

import { ensure } from "./ensure.js";
import { UnixTimestamp } from "./types.js";
import { give, is, its } from "./funkenstein/index.js";

export interface ResolvableConfig<T> {
  previousResolved?: UnixTimestamp;
  startResolved?: boolean;
  startResolvedWith?: T;
  then?: (value: T) => void;
  prohibitResolve?: boolean;
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
      this.resolve(startResolvedWith);
      this.inProgress = false;
    }
    if ( then )
      this.promise.then(then);
  }

  then( callback: (value: T) => void | Promise<void> ) {
    // If there's already a then callback, throw an error
    // TODO: Maybe allow multiple then callbacks? Think of a fitting use case/architecture.
    if ( this.config.then )
      throw new Error('Cannot set multiple then callbacks on a Resolvable.');
    this.promise.then(this.config.then = callback);
    return this;
  }

  get resolved() {
    return !this.inProgress;
  }

  resolve(value?: T | PromiseLike<T>) {
    // console.log('Resolving');
    if ( this.config.prohibitResolve )
      throw new Error('This Resolvable is configured to prohibit resolve. Set config.prohibitResolve to false to allow resolve.');
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

  static resolved() {
    return new Resolvable<void>({ startResolved: true });
  }

  static after(promise: Promise<void>): Resolvable
  static after(init: () => Promise<void>): Resolvable
  static after (promiseOrInit: Promise<void> | (() => Promise<void>)) {
    const init = is.function(promiseOrInit) ? promiseOrInit : () => promiseOrInit;
    const resolvable = new Resolvable({
      prohibitResolve: true,
    });
    // (This is needed so we don't allow the user to resolve the resolvable before the init function is done)
    init().then(() => {
      resolvable.config.prohibitResolve = false;
      resolvable.resolve();
    });
    return resolvable;
  };

  static all<T>(resolvables: Resolvable<T>[]) {
    const allResolvable = new Resolvable<T[]>({
      prohibitResolve: true,
    });
    const values: T[] = [];
    resolvables.forEach((resolvable, index) => {
      resolvable.then(value => {
        values[index] = value;
        if ( resolvables.every(r => r.resolved) ) {
          allResolvable.config.prohibitResolve = false;
          allResolvable.resolve(values);
        }
      });
    });
    return allResolvable;
  };

}