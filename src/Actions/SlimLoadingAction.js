export const SLIM_LOADING_START = 'slim_loading_start';
export const SLIM_LOADING_FINISH = 'slim_loading_finish';
export const SLIM_LOADING_RESET = 'slim_loading_reset';

export function startSlimLoading() {
  return {
    type: SLIM_LOADING_START,
  };
}

export function finishSlimLoading() {
  return {
    type: SLIM_LOADING_FINISH,
  };
}

export function resetSlimLoading() {
  return {
    type: SLIM_LOADING_RESET,
  };
}
