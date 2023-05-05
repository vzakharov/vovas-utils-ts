import _ from "lodash";

import { is } from "./funkenstein/index.js";
import { logger } from "./logger.js";
import { UnixTimestamp } from "./types.js";

const log = logger('vovas-utils.resolvable');

const resolvables: Record<string, Resolvable<any>> = {};

export interface ResolvableConfig<T> {
  previousResolved?: UnixTimestamp;
  startResolved?: boolean;
  startResolvedWith?: T;
  then?: (value: T) => void;
  prohibitResolve?: boolean;
}

export class Resolvable<T = void> {

  inProgress: boolean = true;
  private _resolve: (value?: T | PromiseLike<T>) => void = () => {};
  private _reject: (reason?: any) => void = () => {};
  promise = new Promise<T>((_resolve, _reject) => { Object.assign(this, { _resolve, _reject }); });
  previousResolved: UnixTimestamp | undefined;

  constructor(
    private config: ResolvableConfig<T> = {},
    public id = _.uniqueId('res-')
  ) {
    const { previousResolved, startResolved, startResolvedWith, then } = this.config;
    this.previousResolved = previousResolved;
    if ( startResolved ) {
      this.resolve(startResolvedWith);
      this.inProgress = false;
    }
    if ( then )
      this.then(then);

    resolvables[this.id] = this;
    
  }

  then( callback: (value: T) => void | Promise<void> ) {
    // If there's already a then callback, throw an error
    // TODO: Maybe allow multiple then callbacks? Think of a fitting use case/architecture.
    if ( this.config.then && this.config.then !== callback )
      throw new Error(`Cannot set multiple then callbacks on a Resolvable (${this.id})`);
    this.config.then = callback;
    this.promise.then(value => (
      log("Resolvable.then callback", this),
      callback(value)
    ));
    return this;
  }

  get resolved() {
    return !this.inProgress;
  }

  get everResolved() {
    return this.resolved || !!this.previousResolved;
  }

  resolve(value?: T) {
    if ( this.resolved )
      throw new Error('Cannot resolve a Resolvable that is already resolved.');
    if ( this.config.prohibitResolve )
      throw new Error('This Resolvable is configured to prohibit resolve. Set config.prohibitResolve to false to allow resolve.');
    log("Resolving", this);
    this._resolve(value);
    this.inProgress = false;
    this.previousResolved = Date.now();
    delete resolvables[this.id];
    log('Resolved', this);
  }

  reject(reason?: any) {
    this._reject(reason);
    this.inProgress = false;
  }

  reset(value?: T) {
    this.resolve(value);
    this.start();
  }

  // restart as an alias for reset
  restart(value?: T) {
    this.reset(value);
  }

  start(okayIfInProgress: boolean = false) {
    if ( this.inProgress )
      if ( okayIfInProgress )
        return log.always.yellow(`Resolvable ${this.id} is already in progress. Skipping start.`);
      else
        throw new Error('Cannot start a Resolvable that is already in progress.');
    Object.assign(this, new Resolvable({
      ...this.config,
      startResolved: false,
    }, this.id));
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
    log("Created resolvable", resolvable.id, "resolving after", promiseOrInit);
    // (This is needed so we don't allow the user to resolve the resolvable before the init function is done)
    init().then(() => {
      log("Resolving resolvable", resolvable.id);
      resolvable.config.prohibitResolve = false;
      resolvable.resolve();
      log("Resolved resolvable", resolvable.id);
    });
    return resolvable;
  };

  static all<T>(resolvables: Resolvable<T>[]) {
    const allResolvable = new Resolvable<T[]>({
      prohibitResolve: true,
    });
    const values: T[] = [];
    let leftUnresolved = resolvables.length;
    log("Created resolvable", allResolvable.id, "resolving after all", resolvables.length, "resolvables");
    resolvables.forEach((resolvable, index) => {
      resolvable.promise.catch(error => {
        log("Resolvable", resolvable.id, "rejected with", error);
        throw error;
      });
      resolvable.then(value => {
        values[index] = value;
        leftUnresolved && leftUnresolved--;
        log("Resolvable", resolvable.id, "resolved with", value, "left unresolved", leftUnresolved);
        if ( !leftUnresolved ) {
          log("No more unresolved resolvables, resolving allResolvable", allResolvable.id, "with", values);
          allResolvable.config.prohibitResolve = false;
          allResolvable.resolve(values);
        }
      });
    });
    return allResolvable;
  };

  static get(id?: string) {
    return id ? resolvables[id] : resolvables;
  };

}