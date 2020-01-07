// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n';
import { injectIntl, intlShape } from 'react-intl';
import Watermark from 'Components/Watermark';
import { updateLoader } from 'Components/HighchartsLoader';
import ReactHighcharts from 'react-highcharts';
import ExportButton from 'Components/ExportButton';

type Props = {
  data: any[],
  isLoading: boolean,
  period: number,
  intl: intlShape,
  shouldUpdate: boolean,
};

class CompetitorsRankDistributionChart extends Component<Props> {
  chart: ReactHighcharts;
  exportContainer: ?HTMLDivElement;

  componentDidUpdate(prevProps: Props) {
    if (!this.chart) {
      return;
    }
    const { period, isLoading } = this.props;
    if (isLoading !== prevProps.isLoading || period !== prevProps.period) {
      const chart = this.chart.getChart();
      updateLoader(chart, period, isLoading);
    }
  }

  render() {
    const { period, isLoading } = this.props;
    const self = this;
    const chartHeight = 320;
    const series = this.props.data;

    const config = {
      chart: {
        type: 'spline',
        height: chartHeight,
        marginTop: 5,
        marginRight: 30,
        marginBottom: 50,
        marginLeft: 75,
        colorCount: 13,
        zoomType: 'x',
        events: {
          load() {
            updateLoader(this, period, isLoading);
          },
        },
      },
      legend: {
        enabled: false,
      },
      yAxis: {
        title: {
          text: t('Number of keywords'),
        },
        minTickInterval: 1,
        min: 0,
      },
      xAxis: {
        title: {
          text: t('Rank'),
        },
        tickInterval: 1,
        min: 1,
        max: 10,
      },
      lang: {
        noData: t('Select at least one competitor'),
      },
      title: {
        text: '',
        style: {
          display: 'none',
        },
      },
      series,
      credits: {
        enabled: false,
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
        positioner: function tooltipPositioner(labelWidth, labelHeight, point) {
          const p = this.getPosition(labelWidth, labelHeight, point);
          const maxX = this.chart.plotWidth + 90 - labelWidth;
          p.x = Math.min(p.x, maxX);
          return p;
        },
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
        hideDelay: 5,
      },
      exporting: {
        buttons: {
          contextButton: {
            x: -220,
          },
        },
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 800,
            },
            chartOptions: {
              chart: {
                height: chartHeight,
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
    };

    return (
      <div className="competitors-chart">
        <div
          className="chart-area chart-content"
          ref={container => (this.exportContainer = container)}
        >
          <ExportButton content={() => this.exportContainer} />
          <Watermark big offset />
          <ReactHighcharts
            ref={chartRef => {
              this.chart = chartRef;
            }}
            config={config}
          />
        </div>
      </div>
    );
  }
}

export default injectIntl(CompetitorsRankDistributionChart);
