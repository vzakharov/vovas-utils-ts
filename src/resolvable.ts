import { UnixTimestamp } from "./types.js";

export interface NewResolvableArgs {
  previousResolved?: UnixTimestamp;
  startResolved?: boolean;
}

export default class Resolvable {
  
  inProgress: boolean = true;
  _resolve: () => void = () => {};
  _reject: (reason?: any) => void = () => {};
  promise = new Promise<void>((_resolve, _reject) => { Object.assign(this, { _resolve, _reject }); });
  previousResolved: UnixTimestamp | undefined;

  // constructor(previousResolved?: UnixTimestamp) {
  constructor({ previousResolved, startResolved }: NewResolvableArgs = {}) {
    this.previousResolved = previousResolved;
    if ( startResolved ) {
      this.promise = Promise.resolve();
      this.inProgress = false;
    }
  }

  resolve() {
    // console.log('Resolving');
    this._resolve();
    this.inProgress = false;
    // console.log('Resolved:', this);
  }

  reject(reason?: any) {
    this._reject(reason);
    this.inProgress = false;
  }

  reset() {
    this.resolve();
    Object.assign(this, new Resolvable({ previousResolved: Date.now() }));
  }

}