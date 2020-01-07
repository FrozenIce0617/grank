export const CLEAR_EVERYTHING = 'clear_everything';

export function clearRedux() {
  return {
    type: CLEAR_EVERYTHING,
  };
}

export function clearEverything() {
  return dispatch => {
    localStorage.clear();
    //dispatch(clearRedux()); this is not needed
  };
}
