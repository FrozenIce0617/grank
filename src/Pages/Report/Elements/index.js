import {
  HEADER,
  KEYWORD_LIST,
  TEXT,
  HEADLINE,
  PAGE_BREAK,
  LINK_TO_PUBLIC_REPORT,
  RANKING_DISTRIBUTION_CHART,
  GOOGLE_ANALYTICS_SUMMARY,
  KEYWORD_SUMMARY,
  TOTAL_SEARCH_VOLUME_CHART,
  COMPETITOR_RANKINGS,
  SHARE_OF_VOICE_CHART,
  AVERAGE_RANK_CHART,
} from 'Types/ReportElement';
import Header from './Header';
import CustomText from './CustomText';
import Headline from './Headline';
import Pagebreak from './Pagebreak';
import LinkToReport from './LinkToReport';
import RankingDistribution from './RankingDistribution';
import GoogleAnalytics from './GoogleAnalytics';
import KeywordsSummary from './KeywordsSummary';
import KeywordsList from './KeywordsList';
import SearchVolume from './SearchVolume';
import CompetitorRankings from './CompetitorRankings';
import AverageRankChart from './AverageRankChart';
import ShareOfVoice from './ShareOfVoice';

const widgetsMap = {
  [HEADER]: Header,
  [TEXT]: CustomText,
  [HEADLINE]: Headline,
  [PAGE_BREAK]: Pagebreak,
  [LINK_TO_PUBLIC_REPORT]: LinkToReport,
  [RANKING_DISTRIBUTION_CHART]: RankingDistribution,
  [GOOGLE_ANALYTICS_SUMMARY]: GoogleAnalytics,
  [KEYWORD_SUMMARY]: KeywordsSummary,
  [KEYWORD_LIST]: KeywordsList,
  [TOTAL_SEARCH_VOLUME_CHART]: SearchVolume,
  [COMPETITOR_RANKINGS]: CompetitorRankings,
  [AVERAGE_RANK_CHART]: AverageRankChart,
  [SHARE_OF_VOICE_CHART]: ShareOfVoice,
};

export default widgetsMap;
