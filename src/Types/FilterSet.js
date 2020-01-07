// @flow
import { transform } from 'lodash';
import {
  SHARE_OF_VOICE,
  SHARE_OF_VOICE_CHANGE,
  KEYWORD,
  LOCATION,
  RANK,
  TAGS,
  DOMAINS,
  PERIOD,
  COMPARE_TO,
  STARRED,
  SEARCH_VOLUME,
  RANK_CHANGE,
  SEARCH_ENGINE,
  SEARCH_TYPE,
  VISITORS,
  COUNTRY_LOCALE,
  SERP_FEATURES,
  PAGE_SERP_FEATURES,
  HIGHEST_RANKING_PAGE,
  HIGHEST_RANKING_PAGE_MATCH,
  COUNTRY_NAME,
  IMPRESSIONS,
  CLICKS,
  USER_NAME,
  DATE,
  NOTE,
  KEYWORDS,
  LANDING_PAGES,
  GSC_EXISTS,
  CLIENTS,
  CONNECTION,
  CAMPAIGNS,
  PLACEMENTS,
  DATE_ADDED,
} from 'Types/Filter';

export const EMPTY_FILTER_SET = 'empty';
export const DOMAINS_FILTER_SET = 'domains';
export const KEYWORDS_FILTER_SET = 'keywords';
export const IMPORT_GSC_FILTER_SET = 'import_gsc';
export const IMPORT_UNIVERSAL_FILTER_SET = 'import_universal_connection';
export const NOTES_FILTER_SET = 'notes';
export const AFFILIATE_FILTER_SET = 'affiliate';
export const SALES_FILTER_SET = 'sales';

export type FilterSet =
  | typeof DOMAINS_FILTER_SET
  | typeof KEYWORDS_FILTER_SET
  | typeof EMPTY_FILTER_SET
  | typeof NOTES_FILTER_SET
  | typeof IMPORT_GSC_FILTER_SET
  | typeof IMPORT_UNIVERSAL_FILTER_SET
  | typeof AFFILIATE_FILTER_SET
  | typeof SALES_FILTER_SET;

const filterSetTypes = {
  [EMPTY_FILTER_SET]: 0,
  [DOMAINS_FILTER_SET]: 1,
  [KEYWORDS_FILTER_SET]: 2,
  [IMPORT_GSC_FILTER_SET]: 3,
  [NOTES_FILTER_SET]: 5,
  [IMPORT_UNIVERSAL_FILTER_SET]: 7,
  [AFFILIATE_FILTER_SET]: 11,
  [SALES_FILTER_SET]: 13,
};

export const getFilterSetType = (filterSet: FilterSet) => filterSetTypes[filterSet];

const REQUIRED = 2;
const SHOW_IN_FILTERBAR = 1;
const DEFAULT = 0;

const keywordsFilters = {
  [PERIOD]: REQUIRED,
  [COMPARE_TO]: REQUIRED,
  [DOMAINS]: REQUIRED,
  [STARRED]: SHOW_IN_FILTERBAR,
  [KEYWORD]: SHOW_IN_FILTERBAR,
  [DATE_ADDED]: SHOW_IN_FILTERBAR,
  [TAGS]: SHOW_IN_FILTERBAR,
  [LOCATION]: SHOW_IN_FILTERBAR,
  [RANK]: SHOW_IN_FILTERBAR,
  [RANK_CHANGE]: SHOW_IN_FILTERBAR,
  [SHARE_OF_VOICE]: SHOW_IN_FILTERBAR,
  [SHARE_OF_VOICE_CHANGE]: SHOW_IN_FILTERBAR,
  [SEARCH_VOLUME]: SHOW_IN_FILTERBAR,
  [SEARCH_ENGINE]: SHOW_IN_FILTERBAR,
  [SEARCH_TYPE]: SHOW_IN_FILTERBAR,
  [VISITORS]: SHOW_IN_FILTERBAR,
  [SERP_FEATURES]: SHOW_IN_FILTERBAR,
  [PAGE_SERP_FEATURES]: SHOW_IN_FILTERBAR,
  [HIGHEST_RANKING_PAGE]: SHOW_IN_FILTERBAR,
  [HIGHEST_RANKING_PAGE_MATCH]: SHOW_IN_FILTERBAR,
  [COUNTRY_LOCALE]: SHOW_IN_FILTERBAR,
  [LANDING_PAGES]: SHOW_IN_FILTERBAR,
};

const domainsFilters = {
  [PERIOD]: REQUIRED,
  [COMPARE_TO]: REQUIRED,
  [CLIENTS]: SHOW_IN_FILTERBAR,
  [DOMAINS]: SHOW_IN_FILTERBAR,
};

const importGSCFilters = {
  [DOMAINS]: REQUIRED,
  [KEYWORD]: DEFAULT,
  [COUNTRY_NAME]: DEFAULT,
  [IMPRESSIONS]: DEFAULT,
  [CLICKS]: DEFAULT,
  [GSC_EXISTS]: DEFAULT,
};

const importUniversalFilters = {
  [CONNECTION]: REQUIRED,
  [KEYWORD]: DEFAULT,
  [COUNTRY_LOCALE]: DEFAULT,
};

const notesFilters = {
  [DOMAINS]: REQUIRED,
  [KEYWORDS]: DEFAULT,
  [NOTE]: DEFAULT,
  [USER_NAME]: DEFAULT,
  [DATE]: DEFAULT,
};

const affiliateFilters = {
  [PERIOD]: REQUIRED,
  [CAMPAIGNS]: SHOW_IN_FILTERBAR,
  [PLACEMENTS]: SHOW_IN_FILTERBAR,
  // [UNIQUE_IDS]: SHOW_IN_FILTERBAR,
};

const salesFilters = {
  [PERIOD]: REQUIRED,
};

export const filterSetViews = {
  [KEYWORDS_FILTER_SET]: keywordsFilters,
  [DOMAINS_FILTER_SET]: domainsFilters,
  [IMPORT_GSC_FILTER_SET]: importGSCFilters,
  [NOTES_FILTER_SET]: notesFilters,
  [IMPORT_UNIVERSAL_FILTER_SET]: importUniversalFilters,
  [AFFILIATE_FILTER_SET]: affiliateFilters,
  [SALES_FILTER_SET]: salesFilters,
  [EMPTY_FILTER_SET]: {},
};

export function getFilterBarFilterAttributes(filterSet: FilterSet): string[] {
  const filterSetData = filterSetViews[filterSet];
  return Object.keys(filterSetData).filter(
    filterAttribute => (filterSetData[filterAttribute] & SHOW_IN_FILTERBAR) !== 0,
  );
}

export function isRequiredFilter(filterAttribute: string, filterSet: FilterSet): boolean {
  return (filterSetViews[filterSet][filterAttribute] & REQUIRED) !== 0;
}

export function isNonRequiredFilter(filterAttribute: string, filterSet: FilterSet): boolean {
  return !isRequiredFilter(filterAttribute, filterSet);
}

export function isShownInFilterBar(filterAttribute: string, filterSet: FilterSet): boolean {
  return (filterSetViews[filterSet][filterAttribute] & SHOW_IN_FILTERBAR) !== 0;
}

export function isFilterInSet(filterAttribute: string, filterSet: FilterSet): boolean {
  return filterSetViews[filterSet][filterAttribute] !== undefined;
}

export function getRequiredFilterAttributes(filterSet: FilterSet): string[] {
  return transform(
    filterSetViews[filterSet],
    (acc, value, attribute) => {
      if ((value & REQUIRED) !== 0) {
        acc.push(attribute);
      }
      return acc;
    },
    [],
  );
}
