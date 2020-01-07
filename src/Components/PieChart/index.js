// @flow
import React, { Component } from 'react';
import Watermark from 'Components/Watermark';
import { withRouter } from 'react-router';
import './pie-chart.scss';
import { injectIntl, intlShape } from 'react-intl';
import { isEmpty, orderBy, uniqueId } from 'lodash';
import { updateLoader } from 'Components/HighchartsLoader';

import ReactHighcharts from 'react-highcharts';

import ExportButton from 'Components/ExportButton';
import HighchartsLegendTooltips from 'Components/HighchartsLegendTooltips';

type Props = {
  data: Array<{ name: string, y: number }>,
  noDataMessage: string,
  showLegend?: boolean,
  totalLabel: string,
  seriesLabel: string,
  animate?: boolean,
  linkTo?: string | Function,
  history: Object,
  height?: number,
  width?: number,
  intl: intlShape,
  legendWidth?: number,
  currency: boolean,
  showZeros?: boolean,
  sortByValue: boolean,
  period: number,
  isLoading: boolean,
  watermark: boolean,
  watermarkBig: boolean,
  watermarkCutNumber?: number,
  showSubtitle?: boolean,
  showTitle?: boolean,
  percentage?: boolean,
};

class PieChart extends Component<Props> {
  exportContainer: ?HTMLDivElement;
  chart: ReactHighcharts;

  static defaultProps = {
    showLegend: true,
    animate: true,
    height: 260,
    width: 260,
    currency: false,
    sortByValue: true,
    showSubtitle: true,
    showTitle: true,
  };

  tooltips: HighchartsLegendTooltips | null = null;

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { period, isLoading } = nextProps;
    if (!this.chart) {
      return;
    }

    const chart = this.chart.getChart();

    // Set is loading title for the chart
    if (isLoading !== this.props.isLoading || period !== this.props.period) {
      updateLoader(chart, period, isLoading);
    }
  }

  getChartRef = ref => {
    this.chart = ref;
  };

  renderWatermark() {
    const { watermark, watermarkBig, watermarkCutNumber } = this.props;
    if (!watermark) {
      return;
    }
    return <Watermark big={watermarkBig} cutNumber={watermarkCutNumber} offset />;
  }

  render() {
    const {
      showLegend,
      seriesLabel,
      totalLabel,
      data: originalData,
      intl,
      currency,
      showZeros,
      sortByValue,
      legendWidth,
      period,
      isLoading,
    } = this.props;

    if (!originalData) {
      return null;
    }

    const totalValue = originalData.reduce(
      (currentTotal, dataItem) => currentTotal + dataItem.y,
      0,
    );
    const total = intl.formatNumber(
      totalValue,
      currency
        ? {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        : {},
    );

    let data = showZeros ? originalData : originalData.filter(dataItem => dataItem.y !== 0);

    data = !sortByValue ? data : orderBy(data, ['y'], ['desc']);

    data = data.map(item => ({
      ...item,
      id: uniqueId('legend-tooltip'),
    }));

    const self = this;

    const subtitleNoData = !isEmpty(data) ? this.props.noDataMessage : '';
    const subtitle = totalValue > 0 ? total : subtitleNoData;

    const subTitleFontSize = totalValue > 0 ? '1rem' : '14px !important';

    const marginRight = showLegend ? legendWidth || 210 : 0;
    const width = this.props.width + marginRight;
    const height = this.props.height;
    const config = {
      chart: {
        type: 'pie',
        height,
        width,
        marginRight,
        colorCount: 7,
        className: 'pie-chart',
        style: {
          fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
        },
        events: {
          load() {
            updateLoader(this, period, isLoading);
          },
        },
      },
      legend: {
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        x: 10,
        width: legendWidth || 190,
        useHTML: true,
        enabled: showLegend,
        labelFormatter() {
          let value = this.y;
          const name = this.name;

          if (self.props.currency) {
            value = self.props.intl.formatNumber(value, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          } else if (self.props.percentage) {
            value = self.props.intl.formatNumber(value / 100, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              style: 'percent',
            });
          } else {
            value = self.props.intl.formatNumber(value);
          }
          return `
            <div class="chart-pie-legend-container">
              <div class="legend-item-name-wrapper">
                <div
                  class="legend-item-pointer-circle"
                  style="background-color: ${this.color}"
                ></div>
                <span id="${this.id}" class="chart-pie-legend">${name}</span>
              </div>
              <span class="chart-pie-legend-value">${value}</span>
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
        shared: false,
        shadow: false,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        borderWidth: 0,
        padding: 0,
        zIndex: 2,
        useHTML: true,
        formatter() {
          let value = this.y;
          if (self.props.percentage) {
            value = self.props.intl.formatNumber(value / 100, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              style: 'percent',
            });
          } else {
            value = self.props.intl.formatNumber(value);
          }

          return `<div class="chart-tooltip-box">
              <div class="chart-tooltip-table">
                <div class="chart-tooltip-table-tr">
                  <div class="chart-tooltip-table-th">${this.point.name}</div>
                </div>
                <div class="chart-tooltip-table-tr">
                  <div class="chart-tooltip-table-td">
                    <span class="chart-tooltip-bullet" style="color: ${this.color};">●</span> ${
            this.series.name
          }
                  </div>
                  <div class="chart-tooltip-table-td chart-tooltip-table-right" style="text-align: right;">
                    ${value}
                  </div>
                </div>
              </div>
            </div>`;
        },
        valueDecimals: 0,
        xDateFormat: '%b %e, %Y',
        hideDelay: 5,
      },
      plotOptions: {
        pie: {
          shadow: false,
          cursor: this.props.linkTo ? 'pointer' : undefined,
          events: {
            click: evt => {
              const { linkTo } = this.props;
              let url = linkTo;
              if (linkTo instanceof Function) {
                url = linkTo(evt);
              }
              this.props.history.push(url);
            },
          },
          point: {
            events: {
              legendItemClick: () => {
                const tooltips = this.tooltips;
                // Force update tooltips because legend DOM changes on click
                setTimeout(() => tooltips && tooltips.forceUpdate());
              },
            },
          },
        },
        series: {
          animation: false,
        },
      },
      title: this.props.showTitle && {
        verticalAlign: 'middle',
        align: 'center',
        text: totalLabel,
        x: -marginRight / 2 + 5,
        y: -10,
      },
      subtitle: this.props.showSubtitle && {
        text: subtitle,
        verticalAlign: 'middle',
        x: -marginRight / 2 + 5,
        y: 10,
        style: {
          fontSize: subTitleFontSize,
        },
      },
      series: [
        {
          name: seriesLabel,
          data,
          size: '100%',
          innerSize: '75%',
          showInLegend: true,
          dataLabels: {
            enabled: false,
          },
        },
      ],
      credits: {
        enabled: false,
      },
      noData: {
        style: {
          fontSize: subTitleFontSize,
          fontWeight: 'normal',
        },
        position: {
          y: 5,
        },
      },
      lang: {
        noData: this.props.noDataMessage,
      },
    };
    return (
      <div ref={container => (this.exportContainer = container)} className="chart-content">
        <ExportButton content={() => this.exportContainer} />
        {!!totalValue && this.renderWatermark()}
        <ReactHighcharts ref={this.getChartRef} config={config} />
        {showLegend && (
          <HighchartsLegendTooltips
            ref={ref => {
              this.tooltips = ref;
            }}
            data={() => data}
          />
        )}
      </div>
    );
  }
}

export default injectIntl(withRouter(PieChart));
