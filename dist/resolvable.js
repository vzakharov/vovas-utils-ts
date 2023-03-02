export default class Resolvable {
    inProgress = true;
    _resolve = () => { };
    _reject = () => { };
    promise = new Promise((_resolve, _reject) => { Object.assign(this, { _resolve, _reject }); });
    previousResolved;
    // constructor(previousResolved?: UnixTimestamp) {
    constructor({ previousResolved, startResolved } = {}) {
        this.previousResolved = previousResolved;
        if (startResolved) {
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
    reject(reason) {
        this._reject(reason);
        this.inProgress = false;
    }
    reset() {
        this.resolve();
        Object.assign(this, new Resolvable({ previousResolved: Date.now() }));
    }
}
