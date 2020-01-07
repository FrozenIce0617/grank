// @flow
import { KEYWORD_SUMMARY } from 'Types/ReportElement';
import type { KeywordSummary } from 'Types/ReportElement';
import { t } from 'Utilities/i18n/index';
import KeywordSummaryEditor from '.';

const defaultValue: KeywordSummary = {
  id: '',
  type: KEYWORD_SUMMARY,
  showAverageRank: true,
  showSearchVolume: true,
  groupBy: 'tags',
};

const elementData = {
  defaultValue,
  editor: KeywordSummaryEditor,
  getTitle: () => t('Keyword Summary'),
  getDescription: () => t('Show a summarization the keywords.'),
};

export default elementData;
