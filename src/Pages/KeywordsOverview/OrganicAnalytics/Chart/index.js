// @flow
import React, { Component } from 'react';
import { isEmpty, sortBy, uniqBy, isEqual } from 'lodash';
import { t } from 'Utilities/i18n';
import './chart.scss';
import { injectIntl, intlShape } from 'react-intl';
import Watermark from 'Components/Watermark';
import NotesIcon from 'icons/content-note.svg';
import { updateLoader } from 'Components/HighchartsLoader';
import colorScheme from 'Utilities/colors';
import ReactHighcharts from 'react-highcharts';
import ExportButton from 'Components/ExportButton';

const mainColors = [colorScheme.googleAnalytics.organic];

const notesColor = colorScheme.notes;
const notesSeriesName = 'notes';

type Props = {
  data: Array<Object>,
  height: number,
  intl: intlShape,
  watermark: boolean,
  watermarkBig: boolean,
  watermarkSmall: boolean,
  customWrapper: boolean,
  isLoading: boolean,
  period: number,
  notes: Object[],
  onNoteSelect: Function,
  onMultipleNotesSelect: Function,
};

class Chart extends Component<Props> {
  chart: ReactHighcharts;
  exportContainer: ?HTMLDivElement;

  static defaultProps = {
    data: null,
    height: 200,
    size: '',
    customWrapper: false,
    watermark: false,
    watermarkBig: false,
    watermarkSmall: true,
  };

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

  shouldComponentUpdate(nextProps: Props) {
    return (
      !isEqual(this.props.data, nextProps.data) || nextProps.isLoading !== this.props.isLoading
    );
  }

  getNotesSeries = () => {
    const { notes } = this.props;
    const data = sortBy(
      uniqBy(notes, 'createdAt').map(({ createdAt }) => [new Date(createdAt).getTime(), 0]),
      noteData => noteData[0],
    );

    return notes
      ? [
          {
            name: notesSeriesName,
            yAxis: 1,
            data,
            marker: {
              symbol: `url(${NotesIcon})`,
            },
            states: {
              hover: {
                lineWidthPlus: 0,
              },
            },
            color: notesColor,
            type: 'line',
            lineWidth: 0,
            tooltip: {
              headerFormat: '<div class="chart-tooltip-label">{point.key}</div>',
              pointFormatter: () => '<span />',
            },
          },
        ]
      : [];
  };

  generateSerieConfig(name: string, symbol: string, data: any) {
    const formattedData = data.map(({ date, traffic }) => {
      const newDate = new Date(date).getTime();
      return [newDate, traffic];
    });
    return {
      name,
      color: mainColors[0],
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
      <div className="organic-analytics-chart chart chart-container">
        <div className="chart-area">{chart}</div>
      </div>
    ) : (
      chart
    );

  renderChart() {
    const { data, period, isLoading, notes } = this.props;
    const self = this;
    const seria = this.generateSerieConfig('Total', 'circle', data);
    const series = seria ? [...this.getNotesSeries(), seria] : [seria];

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
        xDateFormat: '%b %e, %Y',
        hideDelay: 5,
      },
      plotOptions: {
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: evt => {
                const { onNoteSelect, onMultipleNotesSelect } = this.props;
                const {
                  series: { name },
                  category,
                } = evt.point;
                if (name === notesSeriesName) {
                  const newNotes = notes.filter(
                    note => new Date(note.createdAt).getTime() === category,
                  );
                  if (newNotes.length === 1) {
                    onNoteSelect(newNotes[0].id);
                    return;
                  }

                  onMultipleNotesSelect(newNotes);
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

    return this.wrapChart(
      <div className="chart-content" ref={container => (this.exportContainer = container)}>
        <ExportButton content={() => this.exportContainer} />
        {!isEmpty(data) && this.renderWatermark()}
        {this.renderChart()}
      </div>,
    );
  }
}

export default injectIntl(Chart);
