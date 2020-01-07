import { createSelector } from 'reselect';

const filterSelector = state => state.filter.filterGroup.filters;

export default filterAttribute =>
  createSelector(filterSelector, filters => filters.find(f => f.attribute === filterAttribute));
