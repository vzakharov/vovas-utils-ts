import { ensure } from "./ensure.js";
import { UnixTimestamp } from "./types.js";

export interface ResolvableConfig<T> {
  previousResolved?: UnixTimestamp;
  startResolved?: boolean;
  startResolvedWith?: T;
  then?: (value: T) => void;
}

export class Resolvable<T = void> {
  
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

  start() {
    if ( this.inProgress )
      throw new Error('Cannot start a Resolvable that is already in progress.');
    Object.assign(this, new Resolvable({
      ...this.config,
      startResolved: false,
    }));
  };



}