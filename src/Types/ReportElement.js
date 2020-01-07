// @flow
export const HEADER = 'header';
export const HEADLINE = 'headline';
export const TEXT = 'text';
export const PAGE_BREAK = 'pagebreak';
export const AVERAGE_RANK_CHART = 'averagerankchart';
export const RANKING_DISTRIBUTION_CHART = 'rankingdistributionchart';
export const GOOGLE_ANALYTICS_SUMMARY = 'googleanalyticssummary';
export const KEYWORD_SUMMARY = 'keywordsummary';
export const KEYWORD_LIST = 'keywordlist';

// TODO Missing implementation
export const TOTAL_SEARCH_VOLUME_CHART = 'searchvolumesumchart';
export const SHARE_OF_VOICE_CHART = 'shareofvoicechart';
export const COMPETITOR_RANKINGS = 'competitors';
export const LINK_TO_PUBLIC_REPORT = 'public';

export type Header = {
  id: string,
  type: typeof HEADER,
  showLogotype: boolean,
};

export type Headline = {
  id: string,
  type: typeof HEADLINE,
  text: string,
};

export type Text = {
  id: string,
  type: typeof TEXT,
  text: string,
};

export type PageBreak = {
  id: string,
  type: typeof PAGE_BREAK,
};

export type AverageRankChart = {
  id: string,
  type: typeof AVERAGE_RANK_CHART,
};

export type RankingDistributionChart = {
  id: string,
  type: typeof RANKING_DISTRIBUTION_CHART,
};

export type GoogleAnalyticsSummary = {
  id: string,
  type: typeof GOOGLE_ANALYTICS_SUMMARY,
};

export type KeywordSummary = {
  id: string,
  type: typeof KEYWORD_SUMMARY,
  showAverageRank: boolean,
  showSearchVolume: boolean,
  groupBy: string,
};

export type KeywordList = {
  id: string,
  type: typeof KEYWORD_LIST,
  showSearchVolume: boolean,
  showVisitsAndPotential: boolean,
  showRankFeatures: boolean,
  showAllRanks: boolean,
  showStartDateRank: boolean,
  showInitialRank: boolean,
  groupBy: string,
  orderBy: string,
};

export type TotalSearchVolumeChart = {
  id: string,
  type: typeof TOTAL_SEARCH_VOLUME_CHART,
};

export type ReportElement =
  | Header
  | Headline
  | Text
  | PageBreak
  | AverageRankChart
  | RankingDistributionChart
  | GoogleAnalyticsSummary
  | KeywordSummary
  | TotalSearchVolumeChart;
