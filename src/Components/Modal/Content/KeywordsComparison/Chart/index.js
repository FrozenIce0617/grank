// @flow
import * as React from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { isEqual } from 'lodash';
import { updateLoader } from 'Components/HighchartsLoader';
import Watermark from 'Components/Watermark';
import { t } from 'Utilities/i18n';
import ReactHighcharts from 'react-highcharts';
import moment from 'moment';

import ExportButton from 'Components/ExportButton';
import colorScheme from 'Utilities/colors';

import './keywords-comparison-chart.scss';

const keywordsColors = colorScheme.competitors;

type Rank = {
  searchDate: string,
  rank: number,
};

type Props = {
  isLoading: boolean,
  period: number,
  intl: intlShape,
  keywordsObj: Object[],
};

class KeywordsComparisonChart extends React.Component<Props> {
  chart: ReactHighcharts;
  exportContainer: ?HTMLDivElement;

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (!this.chart) {
      return;
    }

    const chart = this.chart.getChart();
    const { keywordsObj, isLoading, period } = nextProps;

    // Set is loading title for the chart
    if (isLoading !== this.props.isLoading || period !== this.props.period) {
      updateLoader(chart, period, isLoading);
    }

    let redraw = false;
    if (!keywordsObj !== !this.props.keywordsObj) {
      redraw = true;
    } else if (keywordsObj) {
      keywordsObj.keywords.map(keyword => {
        const seriesItem = chart.get(keyword.id);
        const newData = this.getData(keyword.ranks);

        if (!seriesItem) {
          return;
        }

        if (!isEqual(seriesItem.data, newData)) {
          seriesItem.setData(newData);
          redraw = true;
        }
      });
    }

    redraw && chart.redraw();
  }

  shouldComponentUpdate(nextProps: Props) {
    return nextProps.keywordsObj !== this.props.keywordsObj;
  }

  createSeriesItem(id: string, name: string, data: any, color: string) {
    return {
      id,
      name,
      color,
      pointPlacement: 'between',
      marker: {
        symbol: 'circle',
        radius: 3,
      },
      data,
    };
  }

  getChartRef = ref => {
    this.chart = ref;
  };

  getData = (ranks: Rank[]) =>
    ranks.filter((rankData: Rank) => !!rankData && rankData.rank !== -1).map((rankData: Rank) => [
      +moment(rankData.searchDate)
        .startOf('day')
        .format('x'),
      rankData.rank,
    ]);

  makeKeywordsSeries = () => {
    const { keywordsObj } = this.props;

    if (!keywordsObj) return [];

    return keywordsObj.keywords.map((keyword, idx) => {
      let data = [];
      if (keyword.ranks) {
        data = this.getData(keyword.ranks);
      }

      return this.createSeriesItem(
        keyword.id,
        keyword.keyword,
        data,
        keywordsColors[idx % keywordsColors.length],
      );
    });
  };

  renderChart() {
    const { period, isLoading, keywordsObj } = this.props;
    const self = this;

    const yAxis = [
      {
        allowDecimals: false,
        title: null,
        top: '0%',
        height: '100%',
        labels: {
          style: {
            whiteSpace: 'nowrap',
            textOverflow: 'none',
          },
        },
        reversed: true,
      },
    ];

    const legendWidth = 190;

    const chartBaseConfig = {
      title: {
        text: '',
        style: {
          display: 'none',
        },
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%e %b',
          week: '%e %b',
          month: "%b '%y",
          year: '%Y',
        },
        lineColor: null,
        tickWidth: 0,
        labels: {
          y: 25,
        },
      },
      yAxis,
      credits: {
        enabled: false,
      },
      lang: {
        noData: t('No average rank data for the selected period'),
      },
      tooltip: {
        shared: true,
        shadow: false,
      },
    };

    const chartConfig = {
      ...chartBaseConfig,
      chart: {
        type: 'spline',
        height: 370,
        marginTop: 5,
        marginRight: 20,
        marginBottom: 100,
        marginLeft: 50,
        colorCount: 13,
        zoomType: 'xy',
        events: {
          load() {
            updateLoader(this, period, isLoading);
          },
        },
      },
      series: this.makeKeywordsSeries(),
      legend: {
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        x: 10,
        width: legendWidth,
        useHTML: true,
        enabled: true,
        labelFormatter() {
          let value = this.y;
          const name = this.name;

          value = self.props.intl.formatNumber(value);

          return `
            <div class="keywords-comparison-chart-legend-container">
              <div class="legend-item-name-wrapper">
                <div
                  class="legend-item-pointer-circle"
                  style="background-color: ${this.color}"
                ></div>
                <span id="${this.id}" class="keywords-comparison-chart-legend">${name}</span>
              </div>
            </div>
          `;
        },
        // need to hide symbols from box
        // MUST be a string without 'px', because number 0 doesn't have effect, and '0px' calls errors
        symbolWidth: '0',
        symbolHeight: '0',
        navigation: {
          enabled: false,
        },
      },
      tooltip: {
        shared: true,
        shadow: false,
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E7',
        borderRadius: 0,
        borderWidth: 1,
        padding: 0,
        useHTML: true,
        headerFormat: `<div class="chart-tooltip-table">
            <div class="chart-tooltip-table-tr">
              <div class="chart-tooltip-table-th">
                {point.key}
              </div>
            </div>`,
        pointFormatter() {
          return `
            <div class="chart-tooltip-table-tr">
              <div class="chart-tooltip-table-td">
                  <span class="chart-tooltip-bullet" style="color: ${this.color};">●</span>
                  &nbsp;${this.series.name}
              </div>
              <div class="chart-tooltip-table-td chart-tooltip-table-right" style="text-align: right;">
                  ${self.props.intl.formatNumber(this.y)}
              </div>
            </div>
          `;
        },
        footerFormat: '</div>',
        xDateFormat: '%b %e, %Y',
        hideDelay: 5,
      },
    };
    return <ReactHighcharts ref={this.getChartRef} config={chartConfig} />;
  }

  render() {
    return (
      <div className="keywords-comparison-chart">
        <div
          ref={container => (this.exportContainer = container)}
          className="chart-area chart-content"
        >
          <ExportButton content={() => this.exportContainer} />
          {this.renderChart()}
        </div>
        <Watermark offset big />
      </div>
    );
  }
}

export default injectIntl(KeywordsComparisonChart);
