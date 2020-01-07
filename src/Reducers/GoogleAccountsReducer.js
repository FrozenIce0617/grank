import {
  SET_FROM_CALLBACK,
  TOGGLE_REFETCH,
  SET_PASSED_STATE,
} from '../Actions/GoogleAccountsAction';

const initialState = {
  fromCallback: false, // indicate if we comes from the callback page
  shouldRefetch: false, // indicate if need to refetch Google Accounts data (after callback)
  passedState: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_PASSED_STATE:
      return { ...state, passedState: action.passedState };
    case SET_FROM_CALLBACK:
      return { ...state, fromCallback: action.fromCallback };
    case TOGGLE_REFETCH:
      return { ...state, shouldRefetch: !state.shouldRefetch };
    default:
      return state;
  }
}
