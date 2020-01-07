// @flow
import { RANKING_DISTRIBUTION_CHART } from 'Types/ReportElement';
import type { RankingDistributionChart } from 'Types/ReportElement';
import { t } from 'Utilities/i18n/index';
import RankingDistributionChartEditor from '.';

const defaultValue: RankingDistributionChart = {
  id: '',
  type: RANKING_DISTRIBUTION_CHART,
};

const elementData = {
  defaultValue,
  editor: RankingDistributionChartEditor,
  getTitle: () => t('Ranking Distribution Graph'),
  getDescription: () => t('Insert a graph with the ranking distribution for the period.'),
};

export default elementData;
