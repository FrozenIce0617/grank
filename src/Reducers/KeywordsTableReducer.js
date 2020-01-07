import {
  KEYWORDS_TABLE_SAVE_STATE,
  KEYWORDS_TABLE_RESET_STATE,
} from '../Actions/KeywordsTableActions';

const initialState = {
  tableState: null,
  scrollState: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case KEYWORDS_TABLE_SAVE_STATE:
      return action.payload;
    case KEYWORDS_TABLE_RESET_STATE:
      return initialState;
    default:
      return state;
  }
}
