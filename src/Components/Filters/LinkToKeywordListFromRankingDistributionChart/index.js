// @flow
import type {
  DomainsFilter,
  PeriodFilter,
  CompareToFilter,
  ShareOfVoiceFilter,
  RankFilter,
  BetweenRankFilter,
} from 'Types/Filter';
import { FilterComparison, FilterValueType, FilterAttribute } from 'Types/Filter';
import { KEYWORDS_FILTER_SET } from 'Types/FilterSet';
import moment from 'moment';
import linkWithFilters from 'Components/Filters/linkWithFilters';

const KEYWORDS0TO3_SERIA = '1-3';
const KEYWORDS4TO10_SERIA = '4-10';
const KEYWORDS11TO20_SERIA = '11-20';
const KEYWORDS21TO50_SERIA = '21-50';
const KEYWORDS50ANDUP_SERIA = '51-500';
const KEYWORDSUNRANKED_SERIA = 'Not ranking';

const generateRankFilter = label => {
  switch (label) {
    case KEYWORDS0TO3_SERIA:
    case KEYWORDS4TO10_SERIA:
    case KEYWORDS11TO20_SERIA:
    case KEYWORDS21TO50_SERIA: {
      const range = label.split('-').map(Number);
      return { comparison: FilterComparison.BETWEEN, value: range };
    }
    case KEYWORDS50ANDUP_SERIA:
      return { comparison: FilterComparison.BETWEEN, value: [51, 500] };
    case KEYWORDSUNRANKED_SERIA:
      return { comparison: FilterComparison.GT, value: 500 };
    default:
      return {};
  }
};

export default function linkToKeywordListFromRankingDistributionChart(
  domainId: any,
  category: any,
  label: any,
) {
  const domainsFilter: DomainsFilter = {
    attribute: FilterAttribute.DOMAINS,
    type: FilterValueType.LIST,
    comparison: FilterComparison.CONTAINS,
    value: Array.isArray(domainId) ? domainId : [domainId.toString()],
  };

  const date = moment(category);
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

  const rankFilter: RankFilter | BetweenRankFilter = {
    attribute: FilterAttribute.RANK,
    type: FilterValueType.NUMBER,
    ...{ ...generateRankFilter(label) },
  };

  const link = linkWithFilters(
    '/keywords/list',
    [domainsFilter, rankFilter, periodFilter, compareToFilter],
    KEYWORDS_FILTER_SET,
  );

  return link;
}
