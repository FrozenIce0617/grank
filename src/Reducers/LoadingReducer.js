import { LOADING_START, LOADING_FINISH, LOADING_RESET } from '../Actions/LoadingAction';

const initialState = {
  active: false, //indicate if we are active or not
  stack: 0, //kind of a queue for the loading,
  loadingProps: {},
};

export default function(state = initialState, action) {
  switch (action.type) {
    case LOADING_START:
      return { ...state, loadingProps: action.payload, active: true, stack: state.stack + 1 };
    case LOADING_FINISH:
      return { ...state, stack: Math.max(0, state.stack - 1) };
    case LOADING_RESET:
      return initialState;
    default:
      return state;
  }
}
