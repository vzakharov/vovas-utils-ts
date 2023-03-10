import { ensure } from "./ensure.js";
// export class Resolvable {
export class Resolvable {
    inProgress = true;
    // _resolve: () => void = () => {};
    _resolve = () => { };
    _reject = () => { };
    // promise = new Promise<void>((_resolve, _reject) => { Object.assign(this, { _resolve, _reject }); });
    promise = new Promise((_resolve, _reject) => { Object.assign(this, { _resolve, _reject }); });
    previousResolved;
    // constructor(previousResolved?: UnixTimestamp) {
    constructor({ previousResolved, startResolved, startResolvedWith } = {}) {
        this.previousResolved = previousResolved;
        if (startResolved) {
            this.promise = Promise.resolve(ensure(startResolvedWith));
            this.inProgress = false;
        }
    }
    // resolve() {
    resolve(value) {
        // console.log('Resolving');
        this._resolve(value);
        this.inProgress = false;
        // console.log('Resolved:', this);
    }
    reject(reason) {
        this._reject(reason);
        this.inProgress = false;
    }
    // reset() {
    reset(value) {
        this.resolve(value);
        Object.assign(this, new Resolvable({ previousResolved: Date.now() }));
    }
}
