// @flow
import type { FilterBase } from 'Types/Filter';
import { FilterAttribute } from 'Types/Filter';
import keywordsData from './Editors/Keywords/data';
import DisplayNameData from './Editors/DisplayName/data';
import Domain from './Editors/Domain/data';
import GoogleAnalyticsData from './Editors/HasGoogleAnalytics/data';
import GoogleSearchConsole from './Editors/HasGoogleSearchConsole/data';
import ShareOfVoiceData from './Editors/ShareOfVoice/data';
import locationData from './Editors/Location/data';
import rankData from './Editors/Rank/data';
import RankChangeData from './Editors/RankChange/data';
import searchEngineData from './Editors/SearchEngine/data';
import tagsData from './Editors/Tags/data';
import StarredData from './Editors/Starred/data';
import SearchVolumeData from './Editors/SearchVolume/data';
import ShareOfVoiceChangeData from './Editors/ShareOfVoiceChange/data';
import SearchTypeData from './Editors/SearchType/data';
import VisitorsData from './Editors/Visitors/data';
import SerpFeaturesData from './Editors/SerpFeatures/data';
import PageSerpFeaturesData from './Editors/PageSerpFeatures/data';
import HighestRankingPageData from './Editors/HighestRankingPage/data';
import HighestRankingPageMatch from './Editors/HighestRankingPageMatch/data';
import CountryLocale from './Editors/CountryLocale/data';
import LandingPages from './Editors/LandingPages/data';

import CountryName from './Editors/CountryName/data';
import Impressions from './Editors/Impressions/data';
import Clicks from './Editors/Clicks/data';

import UserName from './Editors/UserName/data';

import Date from './Editors/Date/dataFactory';
import Note from './Editors/Note/data';
import Keywords from './Editors/KeywordsList/data';
import Clients from './Editors/Clients/data';
import Domains from './Editors/Domains/data';

import Placements from './Editors/Placements/data';
import Campaigns from './Editors/Campaigns/data';
import UniqueIds from './Editors/UniqueIds/data';

import { t } from 'Utilities/i18n';

const filtersData = [
  DisplayNameData,
  GoogleAnalyticsData,
  GoogleSearchConsole,
  ShareOfVoiceData,
  keywordsData,
  locationData,
  rankData,
  searchEngineData,
  tagsData,
  StarredData,
  SearchVolumeData,
  ShareOfVoiceChangeData,
  SearchTypeData,
  RankChangeData,
  VisitorsData,
  Domain,
  SerpFeaturesData,
  PageSerpFeaturesData,
  HighestRankingPageData,
  HighestRankingPageMatch,
  CountryLocale,
  LandingPages,
  CountryName,
  Impressions,
  Clicks,
  UserName,
  Date(),
  Date({ title: () => t('Date added'), attribute: FilterAttribute.DATE_ADDED }),
  Note,
  Keywords,
  Clients,
  Domains,
  UniqueIds,
  Placements,
  Campaigns,
];

let filtersDataMap;

const buildFilterDataMap = () =>
  filtersData.reduce((currentVal, filterDataFunc) => {
    const data = filterDataFunc();
    currentVal[data.defaultValue.attribute] = data;
    return currentVal;
  }, {});

function getFilterData(attribute: string) {
  if (!filtersDataMap) {
    filtersDataMap = buildFilterDataMap();
  }
  return filtersDataMap[attribute];
}

export const makeDefaultFilter = (filter: FilterBase) => ({
  ...filter,
  isEmpty: true,
});

export default getFilterData;
