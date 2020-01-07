// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import linkToKeywordListFromChart from 'Components/Filters/LinkToKeywordListFromChart';
import './share-of-voice-chart.scss';
import { t } from 'Utilities/i18n';
import { isEqual } from 'lodash';
import { injectIntl } from 'react-intl';
import Watermark from 'Components/Watermark';
import { updateLoader } from 'Components/HighchartsLoader';
import ReactHighcharts from 'react-highcharts';
import ExportButton from 'Components/ExportButton';
import moment from 'moment';
import helpers, { PropsType } from './helpers';

class Chart extends Component<PropsType, State> {
  chart: ReactHighcharts;

  static defaultProps = {
    height: 200,
    size: '',
    competitorsVisibility: {},
    customWrapper: false,
    watermark: false,
    watermarkBig: false,
    watermarkSmall: true,
    showPercentage: true,
  };

  UNSAFE_componentWillReceiveProps(nextProps: PropsType) {
    if (!this.chart) {
      return;
    }

    const chart = this.chart.getChart();
    const {
      competitorsData: oldCompetitorsData,
      notes: oldNotes,
      isOwnDomainDesktopVisible: oldIsOwnDomainDesktopVisible,
      isOwnDomainMobileVisible: oldIsOwnDomainMobileVisible,
    } = this.props;
    const {
      competitorsVisibility,
      competitorsData,
      isLoading,
      period,
      data,
      notes,
      isOwnDomainDesktopVisible,
      isOwnDomainMobileVisible,
      showPercentage,
    } = nextProps;

    // Set is loading title for the chart
    if (isLoading !== this.props.isLoading || period !== this.props.period) {
      updateLoader(chart, period, isLoading);
    }

    let redraw = helpers.updateNotesSeries(chart, oldNotes, notes);
    redraw =
      helpers.updateMainSeries(
        chart,
        data,
        {
          desktop: oldIsOwnDomainDesktopVisible,
          mobile: oldIsOwnDomainMobileVisible,
        },
        {
          desktop: isOwnDomainDesktopVisible,
          mobile: isOwnDomainMobileVisible,
        },
        this.props.isLoading,
        isLoading,
      ) || redraw;
    redraw =
      helpers.updateCompetitorsSeries(
        chart,
        isLoading ? {} : competitorsVisibility,
        oldCompetitorsData,
        competitorsData,
        nextProps,
      ) || redraw;

    // Redraw if the data or visibility were updated
    if (redraw && showPercentage === this.props.showPercentage) {
      chart.redraw();
    }
    // if showPercentage changes, need to update the whole graph
    else if (showPercentage !== this.props.showPercentage) {
      chart.update(this.getChartConfig(nextProps));
    }
  }

  shouldComponentUpdate(nextProps: PropsType) {
    return !isEqual(nextProps.data, this.props.data);
  }

  getChartConfig = (props = this.props) => {
    const { height: chartHeight, notes, period, isLoading, showPercentage } = props;
    const series = helpers.getChartSeries(props);

    const self = this;

    const yAxis = [
      {
        title: null,
        top: notes ? '5%' : '0%',
        height: '100%',
        labels: {
          style: {
            whiteSpace: 'nowrap',
            textOverflow: 'none',
          },
        },
      },
    ];

    if (notes) {
      yAxis.push({
        top: '0%',
        height: '5%',
        title: null,
        offset: 0,
        visible: false,
      });
    }

    return {
      chart: {
        type: 'spline',
        height: chartHeight,
        marginTop: 5,
        marginRight: 20,
        marginBottom: 30,
        marginLeft: 55,
        colorCount: 13,
        zoomType: 'xy',
        events: {
          load() {
            updateLoader(this, period, isLoading);
          },
        },
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
          day: '%e %b',
          week: '%e %b',
          month: "%b '%y",
          year: '%Y',
        },
        lineColor: null,
        tickWidth: 0,
        labels: {
          overflow: true,
          y: 28,
        },
      },
      yAxis,
      legend: {
        enabled: false,
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
        formatter() {
          const pointDetailsRows = this.points.reduce((acc, point) => {
            if (point.series.userOptions.id === helpers.NOTES_SERIES_NAME) {
              return acc;
            }

            if (showPercentage) {
              return `${acc}<div class="chart-tooltip-table-tr">
                <div class="chart-tooltip-table-td">
                  <span
                    class="chart-tooltip-bullet"
                    style="color: ${point.color};">●</span> ${point.series.name}
                </div>
                <div class="chart-tooltip-table-td chart-tooltip-table-right" style="text-align: right;">
                  ${props.intl.formatNumber(point.y.toFixed(2))}%
                </div>
              </div>`;
            }

            return `${acc}<div class="chart-tooltip-table-tr">
              <div class="chart-tooltip-table-td">
                <span
                  class="chart-tooltip-bullet"
                  style="color: ${point.color};">●</span> ${point.series.name}
              </div>
              <div class="chart-tooltip-table-td chart-tooltip-table-right" style="text-align: right;">
                ${props.intl.formatNumber(point.y)}
              </div>
            </div>`;
          }, '');

          const namesMap = {
            [helpers.DESKTOP]: t('Desktop'),
            [helpers.MOBILE]: t('Mobile'),
          };

          const keywordsDetailsRows = this.points.reduce((acc, point) => {
            if (![helpers.DESKTOP, helpers.MOBILE].includes(point.series.userOptions.id)) {
              return acc;
            }

            const pointData = point.series.userOptions.data.find(item => item[0] === point.key);
            const keywords = pointData ? pointData[2] : 0;

            return `${acc}<div class="chart-tooltip-table-tr">
              <div class="chart-tooltip-table-td">
                ${namesMap[point.series.userOptions.id]}
              </div>
              <div class="chart-tooltip-table-td chart-tooltip-table-right" style="text-align: right;">
                ${keywords}
              </div>
            </div>`;
          }, '');

          return `
            <div class="chart-tooltip-table">
              <div class="chart-tooltip-table-tr">
                <div class="chart-tooltip-table-th">${moment(this.points[0].key).format(
                  'MMM. D, YYYY',
                )}</div>
              </div>
              ${pointDetailsRows}
              ${
                keywordsDetailsRows
                  ? `
                  <div class="chart-tooltip-table-tr">
                    <div class="chart-tooltip-table-td pt-2">
                      ${t('Keywords used for calculation for:')}
                    </div>
                  </div>`
                  : ''
              }
              ${keywordsDetailsRows}
            </div>
          `;
        },
        hideDelay: 5,
      },
      plotOptions: {
        series: {
          label: {
            enabled: true,
            minFontSize: 12,
            maxFontSize: 12,
          },
          cursor: 'pointer',
          point: {
            events: {
              click: evt => {
                const {
                  history,
                  domainId,
                  notes: lastNotes,
                  onNoteSelect,
                  onMultipleNotesSelect,
                } = self.props;
                const {
                  series: { name },
                  category,
                } = evt.point;
                if (name === helpers.NOTES_SERIES_NAME) {
                  const newNotes = lastNotes.filter(
                    note => new Date(note.createdAt).getTime() === category,
                  );
                  if (newNotes.length === 1) {
                    onNoteSelect(newNotes[0].id);
                    return;
                  }

                  onMultipleNotesSelect(newNotes);
                  return;
                }
                if (domainId == null) {
                  return;
                }
                history.push(linkToKeywordListFromChart(domainId, evt.point.category));
              },
            },
          },
        },
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 600,
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
      lang: {
        noData: t('No share of voice data for the selected period'),
      },
    };
  };

  getChartRef = chartRef => {
    this.chart = chartRef;
  };

  wrapChart = chart =>
    !this.props.customWrapper ? (
      <div className="share-of-voice-chart chart-container">
        <div className="chart-area">{chart}</div>
      </div>
    ) : (
      chart
    );

  renderWatermark() {
    if (!this.props.watermark) return null;
    return <Watermark big={this.props.watermarkBig} offset />;
  }

  render() {
    return this.wrapChart(
      <div className="chart-content">
        <ExportButton content={() => this.props.exportContainer} />
        {this.renderWatermark()}
        <ReactHighcharts ref={this.getChartRef} config={this.getChartConfig()} />
      </div>,
    );
  }
}

export default injectIntl(withRouter(Chart));
