// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n/index';
import { isEqual } from 'lodash';
import { updateLoader } from 'Components/HighchartsLoader';
import Watermark from 'Components/Watermark';
import { injectIntl, intlShape } from 'react-intl';
import ReactHighcharts from 'react-highcharts';
import moment from 'moment';
import ExportButton from 'Components/ExportButton';
import MainSeria from './MainSeria';
import NotesSeria from '../../ShareOfVoice/Chart/NotesSeria';

type Props = {
  data: Object,
  domainId: number,
  intl: intlShape,
  loading: boolean,
  period: number,
  notes: Object[],
  onNotesSelect: Function,
};

class AverageRankChart extends Component<Props> {
  chart: ReactHighcharts;
  exportContainer: ?HTMLDivElement;
  notesSeria: NotesSeria;
  mainSeria: MainSeria;

  componentDidUpdate(prevProps: Props) {
    const { period, loading } = this.props;
    if (!this.chart) {
      return;
    }
    // Set is loading title for the chart
    if (loading !== prevProps.loading || period !== prevProps.period) {
      const chart = this.chart.getChart();
      updateLoader(chart, period, loading);
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    return (
      !isEqual(this.props.data, nextProps.data) ||
      nextProps.loading !== this.props.loading ||
      nextProps.period !== this.props.period
    );
  }

  getChartRef = chartRef => {
    this.chart = chartRef;
  };

  getSeriesConfigs = (props: Props) => {
    this.mainSeria = new MainSeria(props);
    if (props.notes) {
      this.notesSeria = new NotesSeria(props);
      return [this.mainSeria.getConfig(), this.notesSeria.getConfig()];
    }
    return [this.mainSeria.getConfig()];
  };

  getChartConfig() {
    const { period, loading, notes } = this.props;

    const seriesConfigs = this.getSeriesConfigs(this.props);

    const self = this;
    const chartHeight = 330;

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
        reversed: true,
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

    const config = {
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
            updateLoader(this, period, loading);
          },
        },
      },
      lang: {
        noData: t('No average rank data for the selected period'),
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
      series: seriesConfigs,
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
          const mainPoints = this.points.filter(x => x.series.userOptions.id === self.mainSeria.id);
          const date = moment(this.points[0].key).format('MMM. D, YYYY');
          return `
            <div class="chart-tooltip-table">
              <div class="chart-tooltip-table-tr">
                <div class="chart-tooltip-table-th">${date}</div>
              </div>
              ${self.mainSeria.getTooltip(mainPoints)}
            </div>
          `;
        },
        valueDecimals: 0,
        xDateFormat: '%b %e, %Y',
        hideDelay: 5,
      },
      plotOptions: {
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: event => {
                const { series } = event.point;
                if (series.userOptions.id === this.mainSeria.id) {
                  this.mainSeria.onClick(event.point);
                } else if (series.userOptions.id === this.notesSeria.id) {
                  this.notesSeria.onClick(event.point);
                }
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
    };

    return config;
  }

  render() {
    return (
      <div
        className="chart-area chart-content"
        ref={container => (this.exportContainer = container)}
      >
        <Watermark big offset />
        <ExportButton content={() => this.exportContainer} />
        <ReactHighcharts ref={this.getChartRef} config={this.getChartConfig()} />
      </div>
    );
  }
}

export default injectIntl(AverageRankChart);
