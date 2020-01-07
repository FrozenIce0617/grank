// @flow
import { GOOGLE_ANALYTICS_SUMMARY } from 'Types/ReportElement';
import type { GoogleAnalyticsSummary } from 'Types/ReportElement';
import { t } from 'Utilities/i18n/index';
import GoogleAnalyticsSummaryEditor from '.';

const defaultValue: GoogleAnalyticsSummary = {
  id: '',
  type: GOOGLE_ANALYTICS_SUMMARY,
};

const elementData = {
  defaultValue,
  editor: GoogleAnalyticsSummaryEditor,
  getTitle: () => t('Google Analytics summary'),
  getDescription: () => t('Insert pie charts with a summary of Google Analytics.'),
};

export default elementData;
