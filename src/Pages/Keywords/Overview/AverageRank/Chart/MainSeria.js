// @flow
import colorScheme from 'Utilities/colors';
import { t } from 'Utilities/i18n';

type Props = {
  data: Object,
  intl: Object,
};

const SERIA_ID = 'averageRank';

class MainSeria {
  props: Props;

  constructor(props: Props) {
    this.props = props;
  }

  get id() {
    return SERIA_ID;
  }

  getConfig = () => {
    const { data } = this.props;
    const avgRankPoints = data
      ? data.map(avgRank => ({
          x: new Date(avgRank.date).getTime(),
          y: Number(avgRank.amount.toFixed(2)),
        }))
      : [];
    return {
      id: SERIA_ID,
      name: t('Average rank'),
      data: avgRankPoints,
      marker: {
        radius: 3,
        symbol: 'circle',
      },
      color: colorScheme.all.darkBlue,
      visible: true,
    };
  };

  getTooltip = (points: any) => {
    const point = points[0];
    if (!point) {
      return '';
    }

    return `<div class="chart-tooltip-table-tr">
      <div class="chart-tooltip-table-td">
        <span class="chart-tooltip-bullet" style="color: ${point.color};">●</span> ${
      point.series.name
    }
      </div>
      <div class="chart-tooltip-table-td chart-tooltip-table-right" style="text-align: right;">
        ${this.props.intl.formatNumber(point.y)}
      </div>
    </div>`;
  };

  onClick = (point: any) => {};
}

export default MainSeria;
