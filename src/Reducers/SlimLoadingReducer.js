import {
  SLIM_LOADING_START,
  SLIM_LOADING_FINISH,
  SLIM_LOADING_RESET,
} from '../Actions/SlimLoadingAction';

const initialState = {
  active: false, //indicate if we are active or not
  stack: 0, //kind of a queue for the loading,
  maxLoadingWidth: 80,
  widthIncrement: 2,
  incrementTimeout: 300,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SLIM_LOADING_START:
      return { ...state, active: true, stack: state.stack + 1 };
    case SLIM_LOADING_FINISH:
      return { ...state, stack: Math.max(0, state.stack - 1) };
    case SLIM_LOADING_RESET:
      return initialState;
    default:
      return state;
  }
}
