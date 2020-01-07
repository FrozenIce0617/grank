import { UPDATE_SCROLL_TARGET, RESET_SCROLL_TARGET } from '../Actions/ScrollAction';

const initialState = {
  scrollTarget: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case UPDATE_SCROLL_TARGET:
      return { ...state, scrollTarget: action.payload };
    case RESET_SCROLL_TARGET:
      return { ...state, ...initialState };
    default:
      return state;
  }
}
