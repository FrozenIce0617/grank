// @flow
import React, { Component } from 'react';
import { isEmpty, isEqual } from 'lodash';
import { t } from 'Utilities/i18n';
import { injectIntl, intlShape } from 'react-intl';
import Watermark from 'Components/Watermark';
import { updateLoader } from 'Components/HighchartsLoader';
import ReactHighcharts from 'react-highcharts';
import ExportButton from 'Components/ExportButton';
import moment from 'moment';
import MainSeria from './MainSeria';
import NotesSeria from '../../ShareOfVoice/Chart/NotesSeria';
import './chart.scss';

type Props = {
  data: Array<Object>,
  height: number,
  intl: intlShape,
  watermark: boolean,
  watermarkBig: boolean,
  watermarkSmall: boolean,
  loading: boolean,
  period: number,
  notes: Object[],
  onNotesSelect: Function,
};

class Chart extends Component<Props> {
  chart: ReactHighcharts;
  exportContainer: ?HTMLDivElement;

  static defaultProps = {
    data: null,
    height: 200,
    size: '',
    watermark: false,
    watermarkBig: false,
    watermarkSmall: true,
  };

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
    return !isEqual(this.props.data, nextProps.data) || nextProps.loading !== this.props.loading;
  }

  getSeriesConfigs = (props: Props) => {
    this.mainSeria = new MainSeria(props);
    if (props.notes) {
      this.notesSeria = new NotesSeria(props);
      return [this.mainSeria.getConfig(), this.notesSeria.getConfig()];
    }
    return [this.mainSeria.getConfig()];
  };

  renderChart() {
    const { period, loading, notes } = this.props;
    const self = this;
    const seriesConfigs = this.getSeriesConfigs(this.props);

    const yAxis = [
      {
        title: null,
        tickAmount: 5,
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

    const config = {
      chart: {
        type: 'spline',
        height: 230,
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
        footerFormat: '</div>',
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
                height: this.props.height,
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
        noData: t('No organic traffic data for the selected period'),
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

    if (!data) {
      return null;
    }

    return (
      <div className="organic-analytics-chart chart chart-container">
        <div className="chart-area">
          <div className="chart-content" ref={container => (this.exportContainer = container)}>
            <ExportButton content={() => this.exportContainer} />
            {!isEmpty(data) && this.renderWatermark()}
            {this.renderChart()}
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(Chart);
