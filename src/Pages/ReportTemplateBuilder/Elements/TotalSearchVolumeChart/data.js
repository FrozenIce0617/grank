// @flow
import { AVERAGE_RANK_CHART } from 'Types/ReportElement';
import type { AverageRankChart } from 'Types/ReportElement';
import { t } from 'Utilities/i18n/index';
import AverageRankChartEditor from '.';

const defaultValue: AverageRankChart = {
  id: '',
  type: AVERAGE_RANK_CHART,
};

const elementData = {
  defaultValue,
  editor: AverageRankChartEditor,
  getTitle: () => t('Average Rank Graph'),
  getDescription: () => t('Insert a graph with the average ranks for the period.'),
};

export default elementData;
