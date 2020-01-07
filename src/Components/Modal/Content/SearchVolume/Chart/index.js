// @flow
import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import Watermark from 'Components/Watermark';
import { isEmpty } from 'lodash';
import { t } from 'Utilities/i18n';
import './search-volume-chart.scss';

import ReactHighcharts from 'react-highcharts';

import ExportButton from 'Components/ExportButton';
import colorScheme from 'Utilities/colors';

type Props = {
  data: Array<Object>,
  height?: number,
  intl: intlShape,
  watermark: boolean,
  watermarkBig: boolean,
  isLoading: boolean,
};

class Chart extends Component<Props> {
  chart: ReactHighcharts;
  exportContainer: ?HTMLDivElement;

  static defaultProps = {
    data: null,
    height: 300,
    size: '',
    customWrapper: false,
    watermark: false,
    watermarkBig: false,
    watermarkSmall: true,
  };

  generateSerieConfig(name: string, symbol: string, data: any) {
    const formattedData = data.map(({ month, volume }) => [new Date(month).getTime(), volume]);
    return {
      name,
      color: colorScheme.searchVolume,
      className: 'current-seria',
      marker: {
        symbol,
        radius: 3,
      },
      data: formattedData,
      visible: true,
    };
  }

  wrapChart = chart =>
    !this.props.customWrapper ? (
      <div className="search-volume-chart chart chart-container">
        <div className="chart-area">{chart}</div>
      </div>
    ) : (
      chart
    );

  renderChart() {
    const { data, height } = this.props;
    const self = this;
    const seria = this.generateSerieConfig('Total', 'circle', data);
    const config = {
      chart: {
        type: 'column',
        height,
        marginTop: 5,
        marginRight: 20,
        marginBottom: 50,
        marginLeft: 50,
        colorCount: 13,
        zoomType: 'xy',
      },
      title: {
        text: '',
        style: {
          display: 'none',
        },
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          month: "%b '%y",
          year: '%Y',
        },
        lineColor: null,
        tickWidth: 0,
        labels: {
          y: 15,
          rotation: -45,
          step: 1,
        },
      },
      yAxis: {
        title: null,
      },
      legend: {
        enabled: false,
      },
      series: [seria],
      credits: {
        enabled: false,
      },
      plotOptions: {
        column: {
          pointPadding: 0.01,
          groupPadding: 0.1,
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
        headerFormat:
          '<div class="chart-tooltip-table"><div class="chart-tooltip-table-tr"><div class="chart-tooltip-table-th">{point.key}</div></div>',
        pointFormatter() {
          return `<div class="chart-tooltip-table-tr">
                    <div class="chart-tooltip-table-td">
                        <span class="chart-tooltip-bullet" style="color: ${this.color};">●</span> ${
            this.series.name
          }
                    </div>
                    <div class="chart-tooltip-table-td chart-tooltip-table-right" style="text-align: right;">
                        ${self.props.intl.formatNumber(this.y)}
                    </div>
                  </div>`;
        },
        footerFormat: '</div>',
        valueDecimals: 0,
        xDateFormat: '%b %Y',
        hideDelay: 5,
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 600,
            },
            chartOptions: {
              chart: {
                height,
              },
              subtitle: {
                text: null,
              },
              navigator: {
                enabled: false,
              },
            },
          },
        ],
      },
      lang: {
        noData: t('No search volume data for the selected period'),
      },
    };

    return (
      <ReactHighcharts
        ref={chartRef => {
          this.chart = chartRef;
        }}
        config={config}
      />
    );
  }

  renderWatermark() {
    if (!this.props.watermark) return null;
    return <Watermark big={this.props.watermarkBig} offset />;
  }

  render() {
    const { data } = this.props;
    if (!data) return null;

    return this.wrapChart(
      <div ref={container => (this.exportContainer = container)} className="chart-content">
        <ExportButton content={() => this.exportContainer} />
        {this.renderChart()}
        {!isEmpty(data) && this.renderWatermark()}
      </div>,
    );
  }
}

export default injectIntl(Chart);
