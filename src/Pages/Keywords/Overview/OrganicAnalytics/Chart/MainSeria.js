// @flow
import colorScheme from 'Utilities/colors';
import { t } from 'Utilities/i18n';

const mainColors = [colorScheme.googleAnalytics.organic];

type Props = {
  data: Object,
  intl: Object,
};

const SERIA_ID = 'organicAnalytics';

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
    const formattedData = data.map(({ date, traffic }) => {
      const newDate = new Date(date).getTime();
      return [newDate, traffic];
    });
    return {
      id: SERIA_ID,
      name: t('Total'),
      color: mainColors[0],
      className: 'current-seria',
      marker: {
        symbol: 'circle',
        radius: 3,
      },
      data: formattedData,
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
