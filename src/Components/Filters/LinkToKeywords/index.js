// @flow
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import type { RankFilter, DomainsFilter, BetweenRankFilter } from 'Types/Filter';
import { FilterComparison, FilterValueType, FilterAttribute } from 'Types/Filter';
import linkWithFilters from 'Components/Filters/linkWithFilters';

const KEYWORDS0TO3_SERIA = '1-3';
const KEYWORDS4TO10_SERIA = '4-10';
const KEYWORDS11TO20_SERIA = '11-20';
const KEYWORDS21TO50_SERIA = '21-50';
const KEYWORDS50ANDUP_SERIA = '51-500';
const KEYWORDSUNRANKED_SERIA = 'Not ranking';

const generateRankFilter = (label: string) => {
  switch (label) {
    case KEYWORDS0TO3_SERIA:
    case KEYWORDS4TO10_SERIA:
    case KEYWORDS11TO20_SERIA:
    case KEYWORDS21TO50_SERIA:
    case KEYWORDS50ANDUP_SERIA: {
      const range = label.split('-').map(Number);
      return { comparison: FilterComparison.BETWEEN, value: range };
    }
    case KEYWORDSUNRANKED_SERIA:
      return { comparison: FilterComparison.GT, value: 500 };
    default:
      return {};
  }
};

const generateFilter = (label: string, domainId: string) => {
  const rankFilter: RankFilter | BetweenRankFilter = {
    attribute: FilterAttribute.RANK,
    type: FilterValueType.NUMBER,
    ...{ ...generateRankFilter(label) },
  };

  const domainsFilter: DomainsFilter = {
    attribute: FilterAttribute.DOMAINS,
    type: FilterValueType.LIST,
    comparison: FilterComparison.CONTAINS,
    value: [domainId],
  };

  return linkWithFilters('/keywords/list', [rankFilter, domainsFilter], KEYWORDS_FILTER_SET);
};

export default function linkToKeywords(label: string, domainId: string) {
  return generateFilter(label, domainId);
}
