export const UPDATE_SCROLL_TARGET = 'update_scroll_target';
export const RESET_SCROLL_TARGET = 'reset_scroll_target';

export function updateScrollTarget(scrollTarget) {
  return {
    type: UPDATE_SCROLL_TARGET,
    payload: scrollTarget,
  };
}

export function resetScrollTarget() {
  return {
    type: RESET_SCROLL_TARGET,
  };
}
