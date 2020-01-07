// @flow
import { createSelector } from 'reselect';
import type { FilterGroup } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';
import { getFilterSetType } from 'Types/FilterSet';

const filterGroupsSelector = state => state.filter.filterGroups;
const filterSetSelector = state => state.filter.filterSet;

export default createSelector(
  [filterGroupsSelector, filterSetSelector],
  (filterGroups: FilterGroup[], filterSet: FilterSet) =>
    filterGroups.filter(filterGroup => {
      const filterGroupType = parseInt(filterGroup.type.split('_')[1], 10);
      const filterSetType = getFilterSetType(filterSet);
      return filterGroupType === filterSetType;
    }),
);
