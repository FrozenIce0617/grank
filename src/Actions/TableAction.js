// @flow
export const RESET_TABLE = 'reset_table';
export const CHANGE_NUMBER_OF_ROWS = 'change_number_of_rows';
export const CHANGE_PAGE = 'change_page';
export const CHANGE_SORTING = 'change_sorting';

type ChangeSortingPayload = {
  tableName: string,
  sortField: string,
  descDefault: boolean,
};

type ChangeRowsNumberPayload = {
  tableName: string,
  numberOfRows: number,
};

type ChangePagePayload = {
  tableName: string,
  page: number,
};

type ResetTablePayload = {
  tableName: string,
  numberOfRows: number,
  sortField: string,
  descDefault: boolean,
};

type ChangePage = {
  type: typeof CHANGE_PAGE,
  payload: ChangePagePayload,
};

type ChangeRowsNumber = {
  type: typeof CHANGE_NUMBER_OF_ROWS,
  payload: ChangeRowsNumberPayload,
};

type ResetTable = {
  type: typeof RESET_TABLE,
  payload: ResetTablePayload,
};

type ChangeSorting = {
  type: typeof CHANGE_SORTING,
  payload: ChangeSortingPayload,
};

export type Action = ChangeRowsNumber | ChangePage | ChangeSorting | ResetTable;

export function resetTable(
  sortField: string,
  descDefault: boolean,
  numberOfRows: number,
  startIndex: number,
  stopIndex: number,
  tableName: string,
): ResetTable {
  return {
    type: RESET_TABLE,
    payload: {
      tableName,
      sortField,
      descDefault,
      numberOfRows,
      startIndex,
      stopIndex,
    },
  };
}

export function changeNumberOfRows(numberOfRows: number, tableName: string): ChangeRowsNumber {
  return {
    type: CHANGE_NUMBER_OF_ROWS,
    payload: {
      tableName,
      numberOfRows,
    },
  };
}

export function changePage(page: number, tableName: string): ChangePage {
  return {
    type: CHANGE_PAGE,
    payload: {
      tableName,
      page,
    },
  };
}

export function changeSorting(
  sortField: string,
  descDefault: boolean = false,
  tableName: string,
): ChangeSorting {
  return {
    type: CHANGE_SORTING,
    payload: {
      tableName,
      sortField,
      descDefault,
    },
  };
}
