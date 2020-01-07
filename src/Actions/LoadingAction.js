export const LOADING_START = 'loading_start';
export const LOADING_FINISH = 'loading_finish';
export const LOADING_RESET = 'loading_reset';

export function startLoading(config) {
  return {
    type: LOADING_START,
    payload: config || {},
  };
}

export function finishLoading() {
  return {
    type: LOADING_FINISH,
  };
}

export function resetLoading() {
  return {
    type: LOADING_RESET,
  };
}
