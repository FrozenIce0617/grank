// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n';
import LabelWithHelp from 'Components/LabelWithHelp';
import colorScheme from 'Utilities/colors';

type Props = {
  rankingDistribution: Object,
  loading: boolean,
};

const colors = colorScheme.rankDistribution;

class LastDayChart extends Component<Props> {
  formatPercent(value: number, total: number) {
    return `${((value * 100) / total).toFixed(1)}%`;
  }

  render() {
    const { rankingDistribution, loading } = this.props;
    if (loading) {
      return null;
    }
    let data = [];
    let total = 1;
    if (rankingDistribution && rankingDistribution.days && rankingDistribution.days.length) {
      const lastDayData = rankingDistribution.days[0];
      total = lastDayData.keywordsTotal || 1;
      data = [
        { name: '1 - 3', value: lastDayData.keywords0To3 },
        { name: '4 - 10', value: lastDayData.keywords4To10 },
        { name: '11 - 20', value: lastDayData.keywords11To20 },
        { name: '21 - 50', value: lastDayData.keywords21To50 },
        { name: '51 - 500', value: lastDayData.keywordsAbove50 },
        { name: t('Not ranking'), value: lastDayData.keywordsUnranked },
      ];
    }

    return (
      <div className="latest-ranking-distribution">
        <LabelWithHelp>{t('Latest')}</LabelWithHelp>
        <div className="label-value-list">
          {data.map((item, index) => (
            <div className="label-value-item" key={item.name}>
              <span className="marker" style={{ background: colors[index] }} />
              <span className="label">{item.name}:</span>
              <span className="value">
                {this.formatPercent(item.value, total)} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default LastDayChart;
