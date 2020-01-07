// @flow
import { isEqual } from 'lodash';

export const DOMAIN = 'domain';
export const DISPLAY_NAME = 'display_name';
export const HAS_GOOGLE_ANALYTICS = 'has_ga';
export const HAS_GOOGLE_SEARCH_CONSOLE = 'has_gsc';
export const SHARE_OF_VOICE = 'share_of_voice';
export const SHARE_OF_VOICE_CHANGE = 'share_of_voice_change';
export const KEYWORD = 'keyword';
export const TAGS = 'tags';
export const LOCATION = 'location';
export const RANK = 'rank';
export const RANK_CHANGE = 'rank_change';
export const SEARCH_TYPE = 'search_type';
export const SEARCH_ENGINE = 'search_engine';
export const DOMAINS = 'domains';
export const STARRED = 'starred';
export const SEARCH_VOLUME = 'search_volume';
export const VISITORS = 'visitors';
export const SERP_FEATURES = 'serp_features';
export const PAGE_SERP_FEATURES = 'page_serp_features';
export const COUNTRY_LOCALE = 'countrylocale';
export const LANDING_PAGES = 'landingpages';
export const HIGHEST_RANKING_PAGE = 'highest_ranking_page';
export const HIGHEST_RANKING_PAGE_MATCH = 'highest_ranking_page_match';
export const PERIOD = 'period';
export const COMPARE_TO = 'compare_to';
export const DATE_ADDED = 'date_added';

export const COUNTRY_NAME = 'countryName';
export const IMPRESSIONS = 'impressions';
export const CLICKS = 'clicks';
export const GSC_EXISTS = 'gscExists';

export const USER_NAME = 'fullName';

export const DATE = 'date';
export const NOTE = 'note';
export const KEYWORDS = 'keywords';
export const CLIENTS = 'clients';
export const CONNECTION = 'connection';

export const CAMPAIGNS = 'campaigns';
export const PLACEMENTS = 'placements';
export const UNIQUE_IDS = 'unique_ids';

const FIRST_DATE = 'first_date';
const LAST_DATE = 'last_date';
export const compareToOptions = {
  FIRST_DATE,
  LAST_DATE,
};

export const FilterAttribute = {
  DOMAIN,
  DOMAINS,
  DISPLAY_NAME,
  HAS_GOOGLE_ANALYTICS,
  HAS_GOOGLE_SEARCH_CONSOLE,
  SHARE_OF_VOICE,
  SHARE_OF_VOICE_CHANGE,
  KEYWORD,
  TAGS,
  LOCATION,
  RANK,
  RANK_CHANGE,
  SEARCH_TYPE,
  SEARCH_ENGINE,
  STARRED,
  SEARCH_VOLUME,
  VISITORS,
  SERP_FEATURES,
  PAGE_SERP_FEATURES,
  HIGHEST_RANKING_PAGE,
  HIGHEST_RANKING_PAGE_MATCH,
  COUNTRY_LOCALE,
  LANDING_PAGES,
  DATE_ADDED,

  PERIOD,
  COMPARE_TO,

  COUNTRY_NAME,
  IMPRESSIONS,
  CLICKS,
  GSC_EXISTS,

  USER_NAME,

  DATE,
  NOTE,
  KEYWORDS,

  CLIENTS,
  CONNECTION,

  CAMPAIGNS,
  PLACEMENTS,
  UNIQUE_IDS,
};

const EQ = 'eq';
const NE = 'ne';
const LT = 'lt';
const GT = 'gt';
const LTE = 'lte';
const GTE = 'gte';
const BETWEEN = 'between';
const ANY = 'any';
const ALL = 'all';
const NONE = 'none';
const EMPTY = 'empty';
const CONTAINS = 'contains';
const NOT_CONTAINS = 'not_contains';
const STARTS_WITH = 'starts_with';
const ENDS_WITH = 'ends_with';

export const NO_FILTER = 'No filter';

type ArrayComparison = typeof ANY | typeof ALL | typeof NONE | typeof EMPTY;

type StringComparison =
  | typeof CONTAINS
  | typeof EQ
  | typeof NE
  | typeof NOT_CONTAINS
  | typeof STARTS_WITH
  | typeof ENDS_WITH;

export const FilterComparison = {
  EQ,
  NE,
  LT,
  GT,
  LTE,
  GTE,
  BETWEEN,
  ANY,
  ALL,
  NONE,
  EMPTY,
  CONTAINS,
  NOT_CONTAINS,
  STARTS_WITH,
  ENDS_WITH,
  NO_FILTER,
};

const STRING = 'string';
const NUMBER = 'num';
const BOOL = 'bool';
const ARRAY = 'array';
const LIST = 'list';
const DATETIME = 'datetime';

export const FilterValueType = {
  STRING,
  NUMBER,
  BOOL,
  ARRAY,
  LIST,
  DATETIME,
};

export type DomainFilter = {
  +attribute: typeof DOMAIN,
  +type: typeof STRING,
  +comparison: typeof CONTAINS,
  +value: string,
};

export type DisplayNameFilter = {
  +attribute: typeof DOMAIN,
  +type: typeof STRING,
  +comparison: typeof CONTAINS,
  +value: string,
};

export type HasGoogleAnalyticsFilter = {
  +attribute: typeof HAS_GOOGLE_ANALYTICS,
  +type: typeof BOOL,
  +comparison: typeof EQ,
  +value: boolean,
};

export type HasGoogleSearchConsoleFilter = {
  +attribute: typeof HAS_GOOGLE_SEARCH_CONSOLE,
  +type: typeof BOOL,
  +comparison: typeof EQ,
  +value: boolean,
};

export type ShareOfVoiceFilter = {
  +attribute: typeof SHARE_OF_VOICE,
  +type: typeof NUMBER,
  +comparison: typeof EQ | typeof GT | typeof LT | typeof LTE | typeof GTE,
  +value: number,
};

export type KeywordFilter = {
  +attribute: typeof KEYWORD,
  +type: typeof STRING,
  +comparison: StringComparison,
  +value: string,
};

export type SearchEngineFilter = {
  +attribute: typeof SEARCH_ENGINE,
  +type: typeof NUMBER,
  +comparison: typeof EQ,
  +value: number,
};

export type CountryLocaleFilter = {
  +attribute: typeof COUNTRY_LOCALE,
  +type: typeof NUMBER,
  +comparison: typeof EQ,
  +value: number,
};

export const TOTAL = 0;
export const DESKTOP = 1;
export const MOBILE = 2;

export type SearchType = typeof TOTAL | typeof MOBILE | typeof DESKTOP;

export type SearchTypeFilter = {
  +attribute: typeof SEARCH_TYPE,
  +type: typeof NUMBER,
  +comparison: typeof EQ,
  +value: SearchType,
};

export type LocationFilter = {
  +attribute: typeof LOCATION,
  +type: typeof STRING,
  +comparison: typeof CONTAINS,
  +value: string,
};

export type TagsFilter = {
  +attribute: typeof TAGS,
  +type: typeof ARRAY,
  +comparison: ArrayComparison,
  +value: Array<string>,
};

export type RankFilter =
  | {
      +attribute: typeof RANK,
      +type: typeof NUMBER,
      +comparison: typeof EQ | typeof GT | typeof LT | typeof LTE | typeof GTE,
      +value: number,
    }
  | {
      +attribute: typeof RANK,
      +type: typeof NUMBER,
      +comparison: typeof BETWEEN,
      +value: [number, number],
    };

export type DomainsFilter = {
  +attribute: typeof DOMAINS,
  +type: typeof LIST,
  +comparison: typeof CONTAINS,
  +value: string[],
};

export type PeriodFilter = {
  +attribute: typeof PERIOD,
  +type: typeof DATETIME,
  +comparison: typeof BETWEEN,
  +value: string,
};

export type CompareToFilter = {
  +attribute: typeof COMPARE_TO,
  +type: typeof DATETIME,
  +comparison: typeof EQ,
  +value: string,
};

export type StarredFilter = {
  +attribute: typeof STARRED,
  +type: typeof BOOL,
  +comparison: typeof EQ,
  +value: boolean,
};

export type RankChangeFilter = {
  +attribute: typeof RANK_CHANGE,
  +type: typeof NUMBER,
  +comparison: typeof EQ | typeof GT | typeof LT | typeof LTE | typeof GTE,
  +value: number,
};

export type SearchVolumeFilter =
  | {
      +attribute: typeof SEARCH_VOLUME,
      +type: typeof NUMBER,
      +comparison: typeof EQ | typeof GT | typeof LT | typeof LTE | typeof GTE,
      +value: number,
    }
  | {
      +attribute: typeof SEARCH_VOLUME,
      +type: typeof NUMBER,
      +comparison: typeof BETWEEN,
      +value: [number, number],
    };

export type ShareOfVoiceChangeFilter = {
  +attribute: typeof SHARE_OF_VOICE_CHANGE,
  +type: typeof NUMBER,
  +comparison: typeof EQ | typeof GT | typeof LT | typeof LTE | typeof GTE,
  +value: number,
};

export type VisitorsFilter =
  | {
      +attribute: typeof VISITORS,
      +type: typeof NUMBER,
      +comparison: typeof EQ | typeof GT | typeof LT | typeof LTE | typeof GTE,
      +value: number,
    }
  | {
      +attribute: typeof VISITORS,
      +type: typeof NUMBER,
      +comparison: typeof BETWEEN,
      +value: [number, number],
    };

export type SerpFeaturesFilter = {
  +attribute: typeof SERP_FEATURES,
  +type: typeof ARRAY,
  +comparison: typeof ALL,
  +value: string[],
};

export type PageSerpFeaturesFilter = {
  +attribute: typeof PAGE_SERP_FEATURES,
  +type: typeof ARRAY,
  +comparison: typeof ALL,
  +value: string[],
};

export type HighestRankingPageFilter = {
  +attribute: typeof HIGHEST_RANKING_PAGE,
  +type: typeof STRING,
  +comparison: StringComparison,
  +value: string,
};

export type HighestRankingPageMatchFilter = {
  +attribute: typeof HIGHEST_RANKING_PAGE_MATCH,
  +type: typeof STRING,
  +comparison: typeof NOT_CONTAINS | typeof EQ | typeof NE,
  +value: string,
};

export type LandingPagesFilter = {
  +attribute: typeof LANDING_PAGES,
  +type: typeof LIST,
  +comparison: typeof CONTAINS,
  +value: string[],
};

export type ImpressionsFilter =
  | {
      +attribute: typeof IMPRESSIONS,
      +type: typeof NUMBER,
      +comparison: typeof EQ | typeof GT | typeof LT | typeof LTE | typeof GTE,
      +value: number,
    }
  | {
      +attribute: typeof IMPRESSIONS,
      +type: typeof NUMBER,
      +comparison: typeof BETWEEN,
      +value: [number, number],
    };

export type CountryNameFilter = {
  +attribute: typeof COUNTRY_NAME,
  +type: typeof STRING,
  +comparison: typeof CONTAINS,
  +value: string,
};

export type GSCExistFilter = {
  +attribute: typeof GSC_EXISTS,
  +type: typeof BOOL,
  +comparison: typeof EQ,
  +value: boolean,
};

export type ClicksFilter =
  | {
      +attribute: typeof CLICKS,
      +type: typeof NUMBER,
      +comparison: typeof EQ | typeof GT | typeof LT | typeof LTE | typeof GTE,
      +value: number,
    }
  | {
      +attribute: typeof CLICKS,
      +type: typeof NUMBER,
      +comparison: typeof BETWEEN,
      +value: [number, number],
    };

export type UserNameFilter = {
  +attribute: typeof USER_NAME,
  +type: typeof STRING,
  +comparison: StringComparison,
  +value: string,
};

export type DateFilter = {
  +attribute: typeof DATE,
  +type: typeof DATETIME,
  +comparison: typeof EQ | typeof BETWEEN,
  +value: string,
};

export type NoteFilter = {
  +attribute: typeof NOTE,
  +type: typeof STRING,
  +comparison: StringComparison,
  +value: string,
};

export type KeywordsFilter = {
  +attribute: typeof KEYWORDS,
  +type: typeof ARRAY,
  +comparison: ArrayComparison,
  +value: Array<string>,
};

export type ClientsFilter = {
  +attribute: typeof CLIENTS,
  +type: typeof LIST,
  +comparison: typeof CONTAINS,
  +value: string[],
};

export type ConnectionFilter = {
  +attribute: typeof CONNECTION,
  +type: typeof STRING,
  +comparison: typeof CONTAINS,
  +value: string,
};

export type CampaignsFilter = {
  +attribute: typeof CAMPAIGNS,
  +type: typeof LIST,
  +comparison: typeof CONTAINS,
  +value: string[],
};

export type PlacementsFilter = {
  +attribute: typeof PLACEMENTS,
  +type: typeof LIST,
  +comparison: typeof CONTAINS,
  +value: string[],
};

export type UniqueIdsFilter = {
  +attribute: typeof UNIQUE_IDS,
  +type: typeof LIST,
  +comparison: typeof CONTAINS,
  +value: string[],
};

export type FilterBase =
  | DomainFilter
  | DisplayNameFilter
  | ShareOfVoiceFilter
  | KeywordFilter
  | RankFilter
  | RankChangeFilter
  | TagsFilter
  | LocationFilter
  | SearchTypeFilter
  | SearchEngineFilter
  | PeriodFilter
  | CompareToFilter
  | StarredFilter
  | CountryLocaleFilter
  | VisitorsFilter
  | SerpFeaturesFilter
  | PageSerpFeaturesFilter
  | LandingPagesFilter
  | CountryNameFilter
  | ImpressionsFilter
  | ClicksFilter
  | GSCExistFilter
  | UserNameFilter
  | DateFilter
  | NoteFilter
  | KeywordsFilter
  | ClientsFilter
  | ConnectionFilter
  | CampaignsFilter
  | PlacementsFilter
  | UniqueIdsFilter;

export type FilterGroup = {
  +name: string,
  +type: string,
  +id: string,
  +filters: FilterBase[],
  +defaultForDomains?: boolean,
  +defaultForKeywords?: [],
};

export const parseValue = (filter: any) => {
  switch (filter.type) {
    case FilterValueType.STRING:
      return filter.value;
    case FilterValueType.BOOL:
      return filter.value === true || filter.value === 'true';
    case FilterValueType.NUMBER:
      if (filter.comparison !== FilterComparison.BETWEEN) {
        return parseFloat(filter.value);
      }
      return JSON.parse(filter.value);
    default:
      try {
        return JSON.parse(filter.value);
      } catch (err) {
        return filter.value;
      }
  }
};

export const stringifyFilterValue = (filter: FilterBase) => {
  if (
    filter.type === FilterValueType.ARRAY ||
    filter.type === FilterValueType.LIST ||
    (filter.comparison === FilterComparison.BETWEEN && filter.type === FilterValueType.NUMBER)
  ) {
    return `${JSON.stringify(filter.value)}`;
  }
  if (filter.type === FilterValueType.BOOL) {
    return filter.value.toString();
  }
  return filter.value;
};

export const parseFilters = (filtersData: string) =>
  JSON.parse(filtersData).map(filter => ({
    ...filter,
    value: parseValue(filter),
  }));

export const stringifyFilters = (filters: Array<FilterBase>) =>
  JSON.stringify(
    filters.map(filter => ({
      ...filter,
      value: stringifyFilterValue(filter),
    })),
  );

export const subfilterDiff = (a: Array<FilterBase>, b: Array<FilterBase>) => {
  const common = Array.from(new Set(a.concat(b).map(item => item.attribute)));
  return common.reduce((acc, attribute) => {
    const valueA = a.find(item => item.attribute === attribute);
    const valueB = b.find(item => item.attribute === attribute);
    return isEqual(valueA, valueB) ? acc : acc.concat(attribute);
  }, []);
};
