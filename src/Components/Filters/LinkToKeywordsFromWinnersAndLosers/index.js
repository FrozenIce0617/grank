// @flow
import type { DomainsFilter, RankChangeFilter } from 'Types/Filter';
import { FilterComparison, FilterValueType, FilterAttribute } from 'Types/Filter';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import linkWithFilters from 'Components/Filters/linkWithFilters';

export default function linkToKeywordsFromWinnersAndLosers(domainId: any, type: string) {
  const domainsFilter: DomainsFilter = {
    attribute: FilterAttribute.DOMAINS,
    type: FilterValueType.LIST,
    comparison: FilterComparison.CONTAINS,
    value: Array.isArray(domainId) ? domainId : [domainId.toString()],
  };

  const rankChangeFilter: RankChangeFilter = {
    attribute: FilterAttribute.RANK_CHANGE,
    type: FilterValueType.NUMBER,
    comparison:
      type === 'Unchanged'
        ? FilterComparison.EQ
        : type === 'Winners'
          ? FilterComparison.LT
          : FilterComparison.GT,
    value: 0,
  };

  const link = linkWithFilters(
    '/keywords/list',
    [domainsFilter, rankChangeFilter],
    KEYWORDS_FILTER_SET,
  );

  return link;
}
