// @flow
import colorScheme from 'Utilities/colors';
import { TOTAL, MOBILE, DESKTOP } from 'Types/Filter';
import type { SearchType } from 'Types/Filter';
import { t } from 'Utilities/i18n';
import linkToKeywordListFromChart from 'Components/Filters/LinkToKeywordListFromChart';

const mainColors = {
  [DESKTOP]: colorScheme.deviceType.desktop,
  [TOTAL]: colorScheme.deviceType.all,
  [MOBILE]: colorScheme.deviceType.mobile,
};

export type SeriesDataItemType = {
  date: any,
  keywords: number,
  shareOfVoice: number,
  shareOfVoicePercentage: number,
};

type Props = {
  searchType: SearchType,
  data: SeriesDataItemType[],
  domain?: string,
  domainId?: number,
  showPercentage: boolean,
  history: Object,
  intl: Object,
};

const SERIA_ID = 'sovData';

class MainSeria {
  props: Props;

  constructor(props: Props) {
    this.props = props;
  }

  get id() {
    return SERIA_ID;
  }

  getConfig = () => {
    const props = this.props;
    let deviceType = t('Total');
    if (props.searchType === DESKTOP) {
      deviceType = t('Desktop');
    } else if (props.searchType === MOBILE) {
      deviceType = t('Mobile');
    }
    const name = `${props.domain || ''} (${deviceType})`;

    const { showPercentage, data } = props;
    const color = mainColors[props.searchType];

    const sovData = data.map(item => {
      return [
        new Date(item.date).getTime(),
        showPercentage ? item.shareOfVoicePercentage : item.shareOfVoice,
        item.keywords,
      ];
    });
    return {
      id: SERIA_ID,
      name,
      color,
      className: 'current-seria',
      marker: {
        symbol: 'circle',
        radius: 3,
      },
      data: sovData,
    };
  };

  getTooltip = (points: any) => {
    if (points.length === 0) {
      return '';
    }
    const point = points[0];
    const formattedValue = this.props.showPercentage
      ? `${this.props.intl.formatNumber(point.y.toFixed(2))}%`
      : this.props.intl.formatNumber(point.y);
    const shareOfVoiceRow = `<div class="chart-tooltip-table-tr">
      <div class="chart-tooltip-table-td">
        <span
          class="chart-tooltip-bullet"
          style="color: ${point.color};">●</span> ${point.series.name}
      </div>
      <div class="chart-tooltip-table-td chart-tooltip-table-right" style="text-align: right;">
        ${formattedValue}
      </div>
    </div>`;

    const pointData = point.series.userOptions.data.find(item => item[0] === point.key);
    const keywords = pointData ? pointData[2] : 0;

    let deviceType = t('Total');
    if (this.props.searchType === DESKTOP) {
      deviceType = t('Desktop');
    } else if (this.props.searchType === MOBILE) {
      deviceType = t('Mobile');
    }

    const keywordsRow = `<div class="chart-tooltip-table-tr">
      <div class="chart-tooltip-table-td pt-2">
        ${t('Keywords used for calculation:')}
      </div>
    </div>
    <div class="chart-tooltip-table-tr">
      <div class="chart-tooltip-table-td">
        ${deviceType}
        </div>
        <div class="chart-tooltip-table-td chart-tooltip-table-right" style="text-align: right;">
          ${keywords}
        </div>
      </div>
    `;
    return `${shareOfVoiceRow}${keywordsRow}`;
  };

  onClick = (point: any) => {
    if (!this.props.domainId) {
      return;
    }
    this.props.history.push(linkToKeywordListFromChart(this.props.domainId, point.category));
  };
}

export default MainSeria;
