// @flow
import { parseValue, FilterValueType } from 'Types/Filter';
import type { FilterBase } from 'Types/Filter';
import { encodeBase64, decodeBase64 } from 'Utilities/underdash';

export const encodeFilters = (filters: Array<FilterBase>, segmentId: string = '') => {
  const filtersWithStringValues = filters.map(filter => ({
    ...filter,
    value: filter.type === FilterValueType.STRING ? filter.value : JSON.stringify(filter.value),
  }));
  const filtersString = JSON.stringify({
    segmentId,
    filters: filtersWithStringValues,
  });
  return encodeBase64(filtersString);
};

export const decodeFilters = (filtersData: string) => {
  const dataObject: Object = JSON.parse(decodeBase64(filtersData));
  const result = {
    segmentId: '',
    filters: [],
  };
  let filtersWithStringValues = [];
  if (Array.isArray(dataObject)) {
    filtersWithStringValues = dataObject;
  } else {
    filtersWithStringValues = dataObject.filters;
    result.segmentId = dataObject.segmentId;
  }
  result.filters = filtersWithStringValues.map(filter => ({
    ...filter,
    value: parseValue(filter),
  }));
  return result;
};
