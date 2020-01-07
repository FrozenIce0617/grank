// @flow
import { createSelector } from 'reselect';
import type { FilterSet } from 'Types/FilterSet';
import { isRequiredFilter, isShownInFilterBar, isNonRequiredFilter } from 'Types/FilterSet';
import { FilterAttribute } from 'Types/Filter';
import type { FilterBase, PeriodFilter } from 'Types/Filter';

const filtersSelector = state => state.filter.filterGroup.filters;
const filterSetSelector = state => state.filter.filterSet;

type FilterFunction = (filterAttribute: string, filterSet: FilterSet) => boolean;
type TransformFunction = (filter: FilterBase) => FilterBase;

type FilterSelectorFactoryArgs = {
  filterFunction?: FilterFunction,
  transformFunction?: TransformFunction,
};

const FilterSelectorFactory = ({ filterFunction, transformFunction }: FilterSelectorFactoryArgs) =>
  createSelector([filtersSelector, filterSetSelector], (filters, filterSet) => {
    let result = filterFunction
      ? filters.filter(filter => filterFunction(filter.attribute, filterSet))
      : filters;

    result = transformFunction
      ? result.reduce((acc, filter) => {
          acc.push(transformFunction(filter));
          return acc;
        }, [])
      : result;

    return result;
  });

export default FilterSelectorFactory;

export const NonRequiredFiltersSelector = FilterSelectorFactory({
  filterFunction: isNonRequiredFilter,
});
export const RequiredFiltersSelector = FilterSelectorFactory({ filterFunction: isRequiredFilter });
export const VisibleFiltersSelector = FilterSelectorFactory({ filterFunction: isShownInFilterBar });

/**
 * Transforms period filter to be able to compare data between exact dates
 * (the compare_to date and the last date in period)
 */
export const compareDatesTransform = (filter: FilterBase): FilterBase => {
  if (filter.attribute !== FilterAttribute.PERIOD) {
    return filter;
  }

  // eslint-disable-next-line no-unused-vars
  const [start, end] = JSON.parse(filter.value);
  return ({
    ...filter,
    value: JSON.stringify([end, end]),
  }: PeriodFilter);
};

export const CompareDatesFiltersSelector = FilterSelectorFactory({
  transformFunction: compareDatesTransform,
});

export const CompareDatesRequiredFiltersSelector = FilterSelectorFactory({
  filterFunction: isRequiredFilter,
  transformFunction: compareDatesTransform,
});
