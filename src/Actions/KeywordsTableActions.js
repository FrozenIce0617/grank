export const KEYWORDS_TABLE_SAVE_STATE = 'keywords_table_save_state';
export const KEYWORDS_TABLE_RESET_STATE = 'keywords_table_reset_state';

export function saveKeywordsTableState({ tableState, scrollState }) {
  return {
    type: KEYWORDS_TABLE_SAVE_STATE,
    payload: { tableState, scrollState },
  };
}

export function resetKeywordsTableState() {
  return {
    type: KEYWORDS_TABLE_RESET_STATE,
  };
}
