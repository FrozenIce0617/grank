import { SET_VAT_STATUS } from '../Actions/OrderPlanAction';

const initialState = {
  vatValid: false,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_VAT_STATUS:
      return { ...state, vatValid: action.payload };
    default:
      return state;
  }
}
