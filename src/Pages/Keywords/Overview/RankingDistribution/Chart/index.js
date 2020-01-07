// @flow
import React, { Component } from 'react';
import moment from 'moment';
import { forOwn, map, isEmpty } from 'lodash';
import { withRouter } from 'react-router';
import { t } from 'Utilities/i18n';
import linkToKeywordListFromRankingDistributionChart from 'Components/Filters/LinkToKeywordListFromRankingDistributionChart';
import { injectIntl, intlShape } from 'react-intl';
import Watermark from 'Components/Watermark';
import { updateLoader } from 'Components/HighchartsLoader';
import colorScheme from 'Utilities/colors';
import ReactHighcharts from 'react-highcharts';
import ExportButton from 'Components/ExportButton';
import NotesSeria from '../../ShareOfVoice/Chart/NotesSeria';
import './rank-distribution-chart.scss';

const KEYWORDS0TO3_SERIA = '1-3';
const KEYWORDS4TO10_SERIA = '4-10';
const KEYWORDS11TO20_SERIA = '11-20';
const KEYWORDS21TO50_SERIA = '21-50';
const KEYWORDS50ANDUP_SERIA = '51-500';
const KEYWORDSUNRANKED_SERIA = 'Not ranking';

const KEYWORDS0TO3_RESPONSE = 'keywords0To3';
const KEYWORDS4TO10_RESPONSE = 'keywords4To10';
const KEYWORDS11TO20_RESPONSE = 'keywords11To20';
const KEYWORDS21TO50_RESPONSE = 'keywords21To50';
const KEYWORDS50ANDUP_RESPONSE = 'keywordsAbove50';
const KEYWORDSUNRANKED_RESPONSE = 'keywordsUnranked';

type Props = {
  data: Object,
  history: Object,
  domainId: string,
  animate?: boolean,
  language: string,
  isLoading?: boolean,
  period?: number,
  intl: intlShape,
  notes: Object[],
  onNotesSelect: Function,
  watermark: boolean,
  watermarkBig: boolean,
  watermarkSmall: boolean,
};

const colors = colorScheme.rankDistribution;

class Chart extends Component<Props> {
  exportContainer: ?HTMLDivElement;
  chart: ReactHighcharts;
  notesSeria: NotesSeria;

  static defaultProps = {
    animate: true,
    watermark: false,
    watermarkBig: false,
    watermarkSmall: true,
  };

  componentDidUpdate(prevProps: Props) {
    const { period, isLoading } = this.props;
    if (!this.chart) {
      return;
    }

    const chart = this.chart.getChart();

    // Set is loading title for the chart
    if (isLoading !== prevProps.isLoading || period !== prevProps.period) {
      updateLoader(chart, period, isLoading);
    }
  }

  generateData = (data: Object) => {
    const seriaNames = [
      KEYWORDS0TO3_SERIA,
      KEYWORDS4TO10_SERIA,
      KEYWORDS11TO20_SERIA,
      KEYWORDS21TO50_SERIA,
      KEYWORDS50ANDUP_SERIA,
      KEYWORDSUNRANKED_SERIA,
    ];

    const responseToSeriaMap = {
      [KEYWORDS0TO3_RESPONSE]: KEYWORDS0TO3_SERIA,
      [KEYWORDS4TO10_RESPONSE]: KEYWORDS4TO10_SERIA,
      [KEYWORDS11TO20_RESPONSE]: KEYWORDS11TO20_SERIA,
      [KEYWORDS21TO50_RESPONSE]: KEYWORDS21TO50_SERIA,
      [KEYWORDS50ANDUP_RESPONSE]: KEYWORDS50ANDUP_SERIA,
      [KEYWORDSUNRANKED_RESPONSE]: KEYWORDSUNRANKED_SERIA,
    };
    const dataToReturn = seriaNames.reduce((obj, seriaName) => ({ ...obj, [seriaName]: [] }), {});
    data.forEach(dataRow => {
      const date = dataRow.date;
      forOwn(responseToSeriaMap, (seria, responseSeria) => {
        if (!dataRow[responseSeria]) return;
        dataToReturn[seria].push({
          x: moment
            .utc(date)
            .toDate()
            .getTime(),
          y: (dataRow[responseSeria] / dataRow.keywordsTotal) * 100,
          keywords: dataRow[responseSeria],
        });
      });
    });

    let index = -1;
    return map(dataToReturn, (dataValue, dataKey) => {
      index += 1;
      return {
        name: dataKey,
        color: colors[index % colors.length],
        marker: {
          symbol: 'circle',
          radius: 3,
        },
        type: 'column',
        pointPlacement: 'between',
        data: dataValue.sort((seriaPoint1, seriaPoint2) => seriaPoint1.x - seriaPoint2.x),
      };
    });
  };

  getNotesSeriaConfig = () => {
    this.notesSeria = new NotesSeria(this.props);
    return this.notesSeria.getConfig();
  };

  getChartRef = chartRef => {
    this.chart = chartRef;
  };

  renderWatermark() {
    if (!this.props.watermark) return null;
    return <Watermark big={this.props.watermarkBig} offset />;
  }

  renderChart(formattedData) {
    const { period, notes, isLoading } = this.props;
    const self = this;
    let serieConfigs = formattedData;
    if (notes && notes.length) {
      serieConfigs = [this.getNotesSeriaConfig(), ...serieConfigs];
    }
    const yAxis = [
      {
        title: null,
        min: 0,
        max: 100,
        tickInterval: 20,
        top: notes ? '2%' : '0%',
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
        top: '-10%',
        height: '7%',
        title: null,
        offset: 0,
        visible: false,
      });
    }

    const config = {
      chart: {
        marginTop: 20,
        marginRight: 20,
        marginBottom: 45,
        marginLeft: 55,
        colorCount: 6,
        zoomType: 'xy',
        events: {
          load() {
            updateLoader(this, period, isLoading);
          },
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
          if (this.notesSeria && this.series.userOptions.id === this.notesSeria.id) {
            return '';
          }
          return `<div class="chart-tooltip-table-tr">
                    <div class="chart-tooltip-table-td">
                        <span class="chart-tooltip-bullet" style="color: ${this.color};">●</span> ${
            this.series.name
          }
                    </div>
                    <div class="chart-tooltip-table-td chart-tooltip-table-right" style="text-align: right;">
                        ${self.props.intl.formatNumber(this.y / 100, {
                          style: 'percent',
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })} (${this.options.keywords})
                    </div>
                  </div>`;
        },
        footerFormat: '</div>',
        xDateFormat: '%b %e, %Y',
        hideDelay: 5,
      },
      plotOptions: {
        line: {
          pointPlacement: 'between',
        },
        area: {
          stacking: 'normal',
        },
        column: {
          stacking: 'normal',
          pointPadding: 0,
          groupPadding: 0,
        },
        series: {
          animation: this.props.animate,
          cursor: 'pointer',
          point: {
            events: {
              click: event => {
                const { history, domainId } = this.props;
                const { series, category } = event.point;
                if (this.notesSeria && series.userOptions.id === this.notesSeria.id) {
                  this.notesSeria.onClick(event.point);
                }
                if (domainId == null) {
                  return;
                }
                history.push(
                  linkToKeywordListFromRankingDistributionChart(domainId, category, series.name),
                );
              },
            },
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
        labels: {
          align: 'left',
        },
        tickWidth: 0,
        lineColor: null,
      },
      yAxis,
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        itemWidth: 65,
        padding: 5,
        useHTML: true,
        y: 17,
        labelFormatter: function() {
          return `
            <div class="legend-item-name-wrapper">
              <div class="legend-item-pointer-circle" style="background-color: ${this.color}"></div>
              <span title="${this.name}" height="30px" class="item-name">${this.name}</span>
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
      series: serieConfigs,
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 600,
            },
            chartOptions: {
              chart: {
                height: 200,
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
      credits: {
        enabled: false,
      },
      lang: {
        noData: t('No ranking distribution data for the selected period'),
      },
    };

    return <ReactHighcharts ref={this.getChartRef} config={config} />;
  }

  render() {
    const { data } = this.props;

    if (!data) {
      return null;
    }

    const formattedData = data.days && this.generateData(data.days);
    return (
      <div
        className="rank-distribution-chart chart-container chart-content"
        ref={container => (this.exportContainer = container)}
      >
        <ExportButton content={() => this.exportContainer} />
        {!isEmpty(formattedData) && this.renderWatermark()}
        {this.renderChart(formattedData)}
      </div>
    );
  }
}

export default injectIntl(withRouter(Chart));
