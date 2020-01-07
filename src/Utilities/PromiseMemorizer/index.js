//@flow

/**
 * Utility class to be used to memorize the result of promise that we received before
 */
export default class PromiseMemorizer {
  constructor() {
    this.result = null;
  }

  /**
   * Replaces promise with new one that resolves immediately if we already has result
   * @param {Function} action that return promise
   * @return {Promise} promise
   */
  wrap(action: () => Promise) {
    if (this.result) {
      return Promise.resolve(this.result);
    }

    return action().then(result => {
      this.result = result;
      return result;
    });
  }

  /**
   * Clears the memorized result
   */
  clear() {
    this.result = null;
  }
}
