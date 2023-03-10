import { ensure } from "./ensure.js";
import { UnixTimestamp } from "./types.js";

export interface NewResolvableArgs<T> {
  previousResolved?: UnixTimestamp;
  startResolved?: boolean;
  startResolvedWith?: T;
}

// export class Resolvable {
export class Resolvable<T = void> {
  
  inProgress: boolean = true;
  // _resolve: () => void = () => {};
  _resolve: (value?: T | PromiseLike<T>) => void = () => {};
  _reject: (reason?: any) => void = () => {};
  // promise = new Promise<void>((_resolve, _reject) => { Object.assign(this, { _resolve, _reject }); });
  promise = new Promise<T>((_resolve, _reject) => { Object.assign(this, { _resolve, _reject }); });
  previousResolved: UnixTimestamp | undefined;

  // constructor(previousResolved?: UnixTimestamp) {
  constructor({ previousResolved, startResolved, startResolvedWith }: NewResolvableArgs<T> = {}) {
    this.previousResolved = previousResolved;
    if ( startResolved ) {
      this.promise = Promise.resolve(ensure(startResolvedWith));
      this.inProgress = false;
    }
  }

  // resolve() {
  resolve(value?: T | PromiseLike<T>) {
    // console.log('Resolving');
    this._resolve(value);
    this.inProgress = false;
    // console.log('Resolved:', this);
  }

  reject(reason?: any) {
    this._reject(reason);
    this.inProgress = false;
  }

  // reset() {
  reset(value?: T | PromiseLike<T>) {
    this.resolve(value);
    Object.assign(this, new Resolvable({ previousResolved: Date.now() }));
  }

}