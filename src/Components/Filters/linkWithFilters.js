// @flow
import { store } from 'Store';
import { encodeFilters } from './serialization';
import { isRequiredFilter, isFilterInSet, KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import type { FilterBase } from 'Types/Filter';
import type { FilterSet } from 'Types/FilterSet';
import { FilterAttribute } from 'Types/Filter';

export default function linkWithFilters(
  to: string,
  newFilters: FilterBase[] = [],
  filterSet?: FilterSet,
  removeFilters?: Array<string> = [],
  resetFilters?: boolean = false,
) {
  const filterState = store.getState().filter;
  let segmentId = '';
  let filters = filterState.filterGroup.filters;
  if (filterSet && filterSet !== filterState.filterSet) {
    filters = filterState.filters.filter(filter => isFilterInSet(filter.attribute, filterSet));
  }
  if (resetFilters) {
    filters = filters.filter(filter =>
      isRequiredFilter(filter.attribute, filterSet || filterState.filterSet),
    );
  }
  if (removeFilters && removeFilters.length) {
    filters = filters.filter(filter => {
      const isRemoved = removeFilters.find(removeFilter => removeFilter === filter.attribute);
      return !isRemoved;
    });
  }
  if (newFilters) {
    const existing = filters.filter(existingFilter => {
      const isReplaced = newFilters.find(
        newFilter => newFilter.attribute === existingFilter.attribute,
      );
      return !isReplaced;
    });
    filters = [...existing, ...newFilters];
  }
  if (resetFilters) {
    // Special case, default domain-specific segments for keywords filter set
    if (filterSet === KEYWORDS_FILTER_SET) {
      const domainsFilter = filters.find(filter => filter.attribute === FilterAttribute.DOMAINS);
      if (domainsFilter && domainsFilter.value.length === 1) {
        const domainId = domainsFilter.value[0];
        const defaultFilterGroup = filterState.filterGroups.find(
          filterGroup =>
            filterGroup.defaultForKeywords &&
            filterGroup.defaultForKeywords.indexOf(domainId) !== -1,
        );
        if (defaultFilterGroup) {
          filters = [...filters, ...defaultFilterGroup.filters];
          segmentId = defaultFilterGroup.id;
        }
      }
    }
  }
  const filterString = encodeFilters(filters, segmentId);
  return `${to}/${filterString}/`;
}
