// @flow
import type { FilterBase } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';
import { stringifyFilters } from 'Types/Filter';
import { getFilterSetType } from 'Types/FilterSet';

const generateCreateUserFilterInput = (
  name: string,
  availableFilters: Array<FilterBase>,
  filterSet: FilterSet,
  extraProps: Object = {},
) => ({
  name,
  type: getFilterSetType(filterSet),
  filters: stringifyFilters(availableFilters),
  ...extraProps,
});

export default generateCreateUserFilterInput;
