// @flow
import React, { Component } from 'react';
import PieChart from 'Components/PieChart';
import { t } from 'Utilities/i18n/index';

export type UnknownCompetitorData = {
  id: number,
  domain: string,
  y: number,
};

type Props = {
  data: UnknownCompetitorData[],
  isLoading: boolean,
  period: number,
};

class CompetitorsDistributionChart extends Component<Props> {
  render() {
    const { data, isLoading, period } = this.props;
    return (
      <div className="competitors-distribution">
        <PieChart
          totalLabel={t('Top Competitors')}
          seriesLabel={t('Weight')}
          data={data}
          isLoading={isLoading}
          period={period}
          noDataMessage={t('No data for the selected period')}
          watermark
          watermarkBig
          watermarkCutNumber={1}
          showTitle={false}
          showSubtitle={false}
          showLegend={false}
          width={300}
          height={325}
        />
      </div>
    );
  }
}

export default CompetitorsDistributionChart;
