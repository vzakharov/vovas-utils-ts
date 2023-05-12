import _ from "lodash";

import { $try, is } from "./funkenstein/index.js";
import { logger } from "./logger.js";
import { UnixTimestamp } from "./types.js";

const log = logger('vovas-utils.resolvable');

// const resolvables: Record<string, Resolvable<any>> = {};

export type PromiseHandlers<T> = {
  then?: (value: T) => void;
  catch?: (reason: any) => void;
  // finally?: () => void;
}

export type ResolvableConfig<T, IdIsOptional extends 'idIsOptional' | false = false> = {
  previousResolved?: UnixTimestamp;
  previousPromise?: Promise<T>;
  startResolved?: boolean;
  startResolvedWith?: T;
  prohibitResolve?: boolean;
} & PromiseHandlers<T> & ( IdIsOptional extends 'idIsOptional' ? { id?: string } : { id: string } );

export class Resolvable<T = void> {

  inProgress: boolean = true;
  private _resolve: (value?: T | PromiseLike<T>) => void = () => {};
  private _reject: (reason?: any) => void = () => {};
  promise = new Promise<T>((_resolve, _reject) => { Object.assign(this, { _resolve, _reject }); });
  // previousResolved: UnixTimestamp | undefined;

  private config: ResolvableConfig<T>;

  constructor(
    config?: ResolvableConfig<T, 'idIsOptional'>,
    slug?: string
  )
  
  constructor(
    slug: string,
  )

  constructor(
    slugOrConfig: string | ResolvableConfig<T, 'idIsOptional'> = {},
    nothingOrSlug: string = 'resolvable',
  ) {

    const [ slug,           config        ] = is.string(slugOrConfig) 
        ? [ slugOrConfig,   {}            ] 
        : [ nothingOrSlug,  slugOrConfig  ];

    const id = config.id ?? _.uniqueId(slug+'-');

    this.config = {
      ...is.string(slugOrConfig) ? {} : slugOrConfig,
      id,
    };

    const { previousResolved, startResolved, startResolvedWith, then, catch: _catch } = config;

    // this.previousResolved = previousResolved;
    if ( startResolved ) {
      this.resolve(startResolvedWith);
      this.inProgress = false;
    }
    if ( then )
      this.then(then);
    if ( _catch )
      this.catch(_catch);

    // resolvables[this.id] = this;
    
  }

  then( callback: (value: T) => void | Promise<void> ) {
    // If there's already a then callback, throw an error
    // TODO: Maybe allow multiple then callbacks? Think of a fitting use case/architecture.
    if ( this.config.then && this.config.then !== callback )
      throw new Error(`Cannot set multiple then callbacks on a Resolvable (${this.id})`);
    this.config.then = callback;
    this.promise.then(value => (
      log(`Calling then callback for Resolvable (${this.id}) with value:`, value),
      callback(value)
    ));
    return this;
  }

  catch( callback: (reason: any) => void | Promise<void> ) {
    // If there's already a catch callback, throw an error
    if ( this.config.catch && this.config.catch !== callback )
      throw new Error(`Cannot set multiple catch callbacks on a Resolvable (${this.id})`);
    this.config.catch = callback;
    this.promise.catch(reason => (
      log(`Calling catch callback for Resolvable (${this.id}) with reason:`, reason),
      callback(reason)
    ));
    return this;
  }

  // TODO: Abstractify then/catch(/finally?) into a single function

  get resolved() {
    return !this.inProgress;
  }

  get previousResolved() {
    return this.config.previousResolved;
  }

  get everResolved() {
    return this.resolved || !!this.previousResolved;
  }

  get id() {
    return this.config.id;
  }

  get lastPromise() {
    return this.config.previousPromise ?? this.promise;
  }

  resolve(value?: T) {
    if ( this.resolved )
      throw new Error('Cannot resolve a Resolvable that is already resolved.');
    if ( this.config.prohibitResolve )
      throw new Error('This Resolvable is configured to prohibit resolve. Set config.prohibitResolve to false to allow resolve.');
    // log(`Resolving ${this.id} with`, value);
    this._resolve(value);
    this.inProgress = false;
    this.config.previousPromise = this.promise;
    this.config.previousResolved = Date.now();
    // delete resolvables[this.id];
    log(`Resolved ${this.id} with`, value);
  }

  reject(reason?: any) {
    this._reject(reason);
    this.inProgress = false;
  }

  restart(value?: T) {
    this.resolve(value);
    this.start();
  }

  // reset as an alias for backwards compatibility
  reset(value?: T) {
    this.restart(value);
  }

  start(okayIfInProgress: boolean = false) {
    if ( this.inProgress )
      if ( okayIfInProgress )
        return log.always.yellow(`Resolvable ${this.id} is already in progress. Skipping start.`);
      else
        throw new Error(`Resolvable ${this.id} is already in progress. Cannot start.`);
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
    return new Resolvable<T>({ startResolved: true, startResolvedWith: value }, 'resolvedWith');
  };

  static resolved() {
    return new Resolvable<void>({ startResolved: true }, 'resolved');
  }

  static after(occurrence: Promise<void> | Resolvable): Resolvable
  static after(init: () => Promise<void> | Resolvable): Resolvable
  static after (occurrenceOrInit: Promise<void> | Resolvable | (() => Promise<void> | Resolvable)) {
    // const init = is.function(promiseOrInit) ? promiseOrInit : () => promiseOrInit;
    const occurrence = is.function(occurrenceOrInit) ? $try(
      occurrenceOrInit,
      error => Promise.reject(error)
    ) : occurrenceOrInit;
    const resolvable = new Resolvable({
      prohibitResolve: true,
    }, 'after');
    log(`Created resolvable ${resolvable.id}, resolving after ${occurrence}`);
    // (This is needed so we don't allow the user to resolve the resolvable before the init function is done)
    occurrence.then(() => {
      log(`Resolvable ${resolvable.id} is now allowed to resolve`);
      resolvable.config.prohibitResolve = false;
      resolvable.resolve();
    }).catch(error => {
      log.always.red(`Resolvable ${resolvable.id} rejected with`, error.toString().split('\n')[0]);
      resolvable.reject(error);
    });
    return resolvable;
  };

  static all<T>(resolvables: Resolvable<T>[]) {
    const allResolvable = new Resolvable<T[]>({
      prohibitResolve: true,
    }, 'all');
    const values: T[] = [];
    let leftUnresolved = resolvables.length;
    log(`Created resolvable ${allResolvable.id}, resolving after resolvables ${_.map(resolvables, 'id')}`);
    resolvables.forEach((resolvable, index) => {
      resolvable.promise
        .then(value => {
          values[index] = value;
          // leftUnresolved && leftUnresolved--;
          log(`Resolvable ${resolvable.id} resolved with`, value);
        })
        .catch(error => {
          log.always.red(`Resolvable ${resolvable.id} rejected with`, error.toString().split('\n')[0]);
        }).
        finally(() => {
          leftUnresolved && leftUnresolved--;
          log(`${leftUnresolved} resolvables left unresolved`);
          if ( !leftUnresolved ) {
            log("No more unresolved resolvables, resolving allResolvable", allResolvable.id, "with", values);
            allResolvable.config.prohibitResolve = false;
            allResolvable.resolve(values);
          }
        });
    });
    return allResolvable;
  };

  // static get(id?: string) {
  //   return id ? resolvables[id] : resolvables;
  // };

}