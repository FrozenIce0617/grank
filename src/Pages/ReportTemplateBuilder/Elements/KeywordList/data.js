// @flow
import { KEYWORD_LIST } from 'Types/ReportElement';
import type { KeywordList } from 'Types/ReportElement';
import { t } from 'Utilities/i18n/index';
import KeywordListEditor from '.';

const defaultValue: KeywordList = {
  id: '',
  type: KEYWORD_LIST,
  showSearchVolume: true,
  showVisitsAndPotential: false,
  showRankFeatures: true,
  showAllRanks: false,
  showStartDateRank: false,
  showInitialRank: false,
  groupBy: '',
  orderBy: 'keyword',
};

const elementData = {
  defaultValue,
  editor: KeywordListEditor,
  getTitle: () => t('Keyword list'),
  getDescription: () => t('Show the list of keywords.'),
};

export default elementData;
