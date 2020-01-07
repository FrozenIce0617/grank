// @flow
import type { DomainsFilter, PeriodFilter, CompareToFilter, TagsFilter } from 'Types/Filter';
import { FilterComparison, FilterValueType, FilterAttribute } from 'Types/Filter';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import moment from 'moment';
import linkWithFilters from 'Components/Filters/linkWithFilters';

export default function LinkToKeywordListFromTag(domainId: any, tag: any) {
  const domainsFilter: DomainsFilter = {
    attribute: FilterAttribute.DOMAINS,
    type: FilterValueType.LIST,
    comparison: FilterComparison.CONTAINS,
    value: Array.isArray(domainId) ? domainId : [domainId.toString()],
  };

  const date = moment(new Date());
  const today = date.format('YYYY-MM-DD');
  const yesterday = date.subtract(1, 'day').format('YYYY-MM-DD');

  const periodFilter: PeriodFilter = {
    attribute: FilterAttribute.PERIOD,
    type: FilterValueType.DATETIME,
    comparison: FilterComparison.BETWEEN,
    value: JSON.stringify([yesterday, today]),
  };

  const compareToFilter: CompareToFilter = {
    attribute: FilterAttribute.COMPARE_TO,
    type: FilterValueType.DATETIME,
    comparison: FilterComparison.EQ,
    value: yesterday,
  };

  const tagFiler: TagsFilter = {
    attribute: FilterAttribute.TAGS,
    type: FilterValueType.ARRAY,
    comparison: tag ? FilterComparison.ANY : FilterComparison.EMPTY,
    value: [tag],
  };

  return linkWithFilters(
    '/keywords/list',
    [domainsFilter, periodFilter, compareToFilter, tagFiler],
    KEYWORDS_FILTER_SET,
  );
}
