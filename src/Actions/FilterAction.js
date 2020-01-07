// @flow
import type { FilterBase, FilterGroup, DomainsFilter } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';

export const INIT_FILTERS = 'init_filters';
export const SELECT_FILTERSET = 'select_filterset';
export const SET_DEFAULT_FILTERS = 'set_default_filters';
export const SET_FILTERS = 'set_filters';

export const SAVE_FILTER_GROUP = 'save_filter_group';
export const DELETE_FILTER_GROUP = 'remove_filter_group';
export const RENAME_FILTER_GROUP = 'rename_filter_group';
export const TOGGLE_DEFAULT_FILTER_GROUP = 'toggle_default_filter_group';
export const UPDATE_FILTER_GROUPS = 'update_filter_groups';
export const UPDATE_FILTER_GROUP_FILTERS = 'update_filter_group_filters';

export const UPDATE_DEFAULT_COMPARE_TO = 'UPDATE_DEFAULT_COMPARE_TO';

type InitFilters = {
  type: typeof INIT_FILTERS,
  domainsFilter: DomainsFilter,
};

type SelectFilterSet = {
  type: typeof SELECT_FILTERSET,
  filterSet: FilterSet,
};

type SetDefaultFilters = {
  type: typeof SET_DEFAULT_FILTERS,
};

type SaveFilterGroupAction = {
  type: typeof SAVE_FILTER_GROUP,
  filterGroup: FilterGroup,
};

type DeleteFilterGroup = {
  type: typeof DELETE_FILTER_GROUP,
  id: string,
};

type RenameFilterGroup = {
  type: typeof RENAME_FILTER_GROUP,
  id: string,
  name: string,
};

type ToggleDefaultFilterGroup = {
  type: typeof TOGGLE_DEFAULT_FILTER_GROUP,
  id: string,
  isDefault: boolean,
};

type SetFilters = {
  type: typeof SET_FILTERS,
  filters: Array<FilterBase>,
  segmentId: string,
};

type UpdateFilterGroups = {
  type: typeof UPDATE_FILTER_GROUPS,
  filterGroups: Array<FilterGroup>,
};

type UpdateFilterGroupFilters = {
  type: typeof UPDATE_FILTER_GROUP_FILTERS,
  id: string,
  filters: Array<FilterBase>,
};

type UpdateDefaultCompareTo = {
  type: typeof UPDATE_DEFAULT_COMPARE_TO,
  id: string,
};

export type Action =
  | InitFilters
  | SaveFilterGroupAction
  | DeleteFilterGroup
  | RenameFilterGroup
  | SetFilters
  | SelectFilterSet
  | UpdateFilterGroups
  | SetDefaultFilters
  | ToggleDefaultFilterGroup
  | UpdateFilterGroupFilters
  | UpdateDefaultCompareTo;

export function initFilters(domainsFilter: DomainsFilter): InitFilters {
  return {
    type: INIT_FILTERS,
    domainsFilter,
  };
}

export function selectFilterSet(filterSet: FilterSet): SelectFilterSet {
  return {
    type: SELECT_FILTERSET,
    filterSet,
  };
}

export function setFilters(filters: Array<FilterBase>, segmentId: string) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_FILTERS,
      filters,
      segmentId,
    });
    sessionStorage.setItem(
      'all_filters',
      JSON.stringify({
        filters: getState().filter.filters,
      }),
    );
  };
}

export function setDefaultFilters() {
  return (dispatch, getState) => {
    dispatch({
      type: SET_DEFAULT_FILTERS,
    });
    sessionStorage.setItem(
      'all_filters',
      JSON.stringify({
        filters: getState().filter.filters,
      }),
    );
  };
}

export function saveFilterGroup(filterGroup: FilterGroup): SaveFilterGroupAction {
  return {
    type: SAVE_FILTER_GROUP,
    filterGroup,
  };
}

export function deleteFilterGroup(id: string): DeleteFilterGroup {
  return {
    type: DELETE_FILTER_GROUP,
    id,
  };
}

export function renameFilterGroup(id: string, name: string): RenameFilterGroup {
  return {
    type: RENAME_FILTER_GROUP,
    id,
    name,
  };
}

export function toggleDefaultFilterGroup(id: string, isDefault: boolean): ToggleDefaultFilterGroup {
  return {
    type: TOGGLE_DEFAULT_FILTER_GROUP,
    id,
    isDefault,
  };
}

export function updateFilterGroups(filterGroups: Array<FilterGroup>): UpdateFilterGroups {
  return {
    type: UPDATE_FILTER_GROUPS,
    filterGroups,
  };
}

export function updateFilterGroupFilters(id: string, filters: any): UpdateFilterGroupFilters {
  return {
    type: UPDATE_FILTER_GROUP_FILTERS,
    id,
    filters,
  };
}

export function updateDefaultCompareTo(id: string): UpdateDefaultCompareTo {
  return {
    type: UPDATE_DEFAULT_COMPARE_TO,
    id,
  };
}
