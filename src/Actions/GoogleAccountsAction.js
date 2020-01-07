export const SET_FROM_CALLBACK = 'ga_do_from_callback';
export const TOGGLE_REFETCH = 'ga_toggle_refetch';
export const SET_PASSED_STATE = 'ga_set_passed_state';

export function gaSetPassedState(passedState) {
  return {
    type: SET_PASSED_STATE,
    passedState,
  };
}

export function gaSetFromCallback(fromCallback) {
  return {
    type: SET_FROM_CALLBACK,
    fromCallback,
  };
}

export function gaToggleRefetch() {
  return {
    type: TOGGLE_REFETCH,
  };
}
