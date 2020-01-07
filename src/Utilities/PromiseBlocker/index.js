/**
 * Utility class to be used to ensure that mutually exclusive asynchronous operations will not result in race conditions,
 * and also to act as a way to "discard" asynchronous requests that you are no longer interested in
 */
export default class PromiseBlocker {
  constructor() {
    this.promise = null;
  }

  /**
   * Replaces promise in the blocker in the new one.
   * If this instance was used to wrap a promise before,
   * it is guaranteed that they will never trigger their callbacks, if they were not already triggered
   * @param {Promise} promise to wrap
   * @return {Promise} promise
   */
  wrap(promise) {
    this.promise = promise;
    return new Promise((resolve, reject) => {
      promise.then(
        (...args) => {
          if (this.promise === promise) {
            resolve.apply(this, args);
          }
        },
        (...args) => {
          if (this.promise === promise) {
            reject.apply(this, args);
          }
        },
      );
    });
  }

  cancel() {
    this.promise = null;
  }
}
