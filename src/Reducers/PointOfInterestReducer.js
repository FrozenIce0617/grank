import { HIDE_ARROWS } from '../Actions/PointOfInterestAction';
import LocalStorage from 'Utilities/storage';

const StorageKey = 'arrowOfInterestClosed';

const initialState = {
  closed: !!LocalStorage.get(StorageKey),
};

export default function(state = initialState, action) {
  switch (action.type) {
    case HIDE_ARROWS:
      return { ...state, closed: true };
    default:
      return state;
  }
}
