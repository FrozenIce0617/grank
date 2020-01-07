// @flow
import {
  CHANGE_NUMBER_OF_ROWS,
  CHANGE_PAGE,
  CHANGE_SORTING,
  RESET_TABLE,
} from 'Actions/TableAction';
import type { Action } from 'Actions/TableAction';
import { toNestedReducer } from 'Utilities/reducers';

type State = {
  +numberOfRows: number,
  +page: number,
  +sortOrder: 'asc' | 'desc',
  +sortField: string,
};

const initialState: State = {
  numberOfRows: 25,
  page: 1,
  sortOrder: 'asc',
  sortField: '',
};

const toggleSortOrder = (sortOrder: 'asc' | 'desc') => (sortOrder === 'asc' ? 'desc' : 'asc');

const particularTableReducer = (state: State = initialState, { payload, type }: Action): State => {
  switch (type) {
    case CHANGE_NUMBER_OF_ROWS:
      return { ...state, numberOfRows: payload.numberOfRows };
    case CHANGE_PAGE:
      return { ...state, page: payload.page };
    case CHANGE_SORTING: {
      const defaultOrder = payload.descDefault ? 'desc' : 'asc';
      const newSortOrder =
        payload.sortField === state.sortField ? toggleSortOrder(state.sortOrder) : defaultOrder;
      return { ...state, sortField: payload.sortField, sortOrder: newSortOrder, page: 1 };
    }
    case RESET_TABLE: {
      const defaultOrder = payload.descDefault ? 'desc' : 'asc';
      return {
        ...state,
        ...initialState,
        sortField: payload.sortField,
        sortOrder: defaultOrder,
        numberOfRows: payload.numberOfRows,
        startIndex: payload.startIndex,
        stopIndex: payload.stopIndex,
        page: 1,
      };
    }
    default:
      return state;
  }
};

export default (state: State = initialState, action: Action): State =>
  toNestedReducer(
    particularTableReducer,
    act => (act && act.payload && act.payload.tableName ? [act.payload.tableName] : []),
  )(state, action);
