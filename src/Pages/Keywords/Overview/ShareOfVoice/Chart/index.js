// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { t } from 'Utilities/i18n';
import { isEqual } from 'lodash';
import { injectIntl } from 'react-intl';
import Watermark from 'Components/Watermark';
import { updateLoader } from 'Components/HighchartsLoader';
import ReactHighcharts from 'react-highcharts';
import ExportButton from 'Components/ExportButton';
import type { SearchType } from 'Types/Filter';
import MainSeria from './MainSeria';
import moment from 'moment';
import type { SeriesDataItemType } from './MainSeria';
import NotesSeria from './NotesSeria';

type Props = {
  domainId?: number,
  domain?: string,
  searchType: SearchType,
  notes: Object[],
  onNotesSelect: Function,
  data: SeriesDataItemType[],
  height: any,
  history: Object,
  intl: Object,
  period: number,
  watermark: boolean,
  watermarkBig: boolean,
  isLoading: boolean,
  exportContainer: any,
  showPercentage: boolean,
};

class Chart extends Component<Props> {
  chart: ReactHighcharts;
  mainSeria: MainSeria;
  notesSeria: NotesSeria;

  static defaultProps = {
    height: 200,
    size: '',
    watermark: false,
    watermarkBig: false,
    watermarkSmall: true,
    showPercentage: true,
  };

  shouldComponentUpdate(nextProps: Props) {
    return (
      !isEqual(this.props.data, nextProps.data) ||
      nextProps.isLoading !== this.props.isLoading ||
      nextProps.period !== this.props.period ||
      nextProps.showPercentage !== this.props.showPercentage ||
      nextProps.domain !== this.props.domain ||
      nextProps.notes !== this.props.notes
    );
  }

  componentDidUpdate(prevProps: Props) {
    if (!this.chart) {
      return;
    }
    const { period, isLoading } = this.props;
    const chart = this.chart.getChart();
    if (isLoading !== prevProps.isLoading || period !== prevProps.period) {
      updateLoader(chart, period, isLoading);
    }
  }

  getSeriesConfigs = (props: Props) => {
    this.mainSeria = new MainSeria(props);
    if (props.notes) {
      this.notesSeria = new NotesSeria(props);
      return [this.mainSeria.getConfig(), this.notesSeria.getConfig()];
    }
    return [this.mainSeria.getConfig()];
  };

  getChartConfig = (props = this.props) => {
    const { height: chartHeight, notes, period, isLoading } = props;
    const seriesConfigs = this.getSeriesConfigs(props);
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
      lang: {
        noData: t('No share of voice data for the selected period'),
      },
    };
  };

  getChartRef = chartRef => {
    this.chart = chartRef;
  };

  renderWatermark() {
    if (!this.props.watermark) return null;
    return <Watermark big={this.props.watermarkBig} offset />;
  }

  render() {
    return (
      <div className="share-of-voice-chart chart-container">
        <div className="chart-area">
          <div className="chart-content">
            <ExportButton content={() => this.props.exportContainer} />
            {this.renderWatermark()}
            <ReactHighcharts ref={this.getChartRef} config={this.getChartConfig()} />
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(withRouter(Chart));
