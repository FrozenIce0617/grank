// @flow
import React, { Component } from 'react';
import './landing-pages-chart.scss';
import { injectIntl, intlShape } from 'react-intl';
import Watermark from 'Components/Watermark';
import { updateLoader } from 'Components/HighchartsLoader';
import { t } from 'Utilities/i18n';
import HighchartsLegendTooltips from 'Components/HighchartsLegendTooltips';
import NotesIcon from 'icons/content-note.svg';

import ReactHighcharts from 'react-highcharts';
import { isEqual, sortBy, uniqBy } from 'lodash';

import ExportButton from 'Components/ExportButton';
import colorScheme from 'Utilities/colors';

const colors = colorScheme.defaultLines;

type Props = {
  selectedLandingPages: Set<string | null>,
  landingPagesData: Map<string | null, Object>,
  landingPagesColors: { [key: string]: string },
  isLoading: boolean,
  intl: intlShape,
  shouldUpdate: number,
  showFake: boolean,
  period: number,
  notes: Object[],
  onNoteSelect: Function,
  onMultipleNotesSelect: Function,
};

type State = {
  visibility: Map<string | null, Object>,
};

const notesColor = colorScheme.notes;
const notesSeriesName = 'notes';

class LandingPagesChart extends Component<Props, State> {
  chart: ReactHighcharts;
  exportContainer: ?HTMLDivElement;
  tooltips: HighchartsLegendTooltips | null = null;
  _isMounted: boolean = false;

  state = {
    visibility: new Map(),
  };

  componentDidMount() {
    this._isMounted = true;
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (!this.chart || nextProps.showFake) {
      return;
    }

    const chart = this.chart.getChart();
    const { landingPagesData, isLoading, period, selectedLandingPages } = nextProps;

    // Set is loading title for the chart
    if (isLoading !== this.props.isLoading || period !== this.props.period) {
      updateLoader(chart, period, isLoading);
    }

    let redraw = false;
    // hides/shows all series when isLoading changes
    redraw = this.updateSeries(chart, this.props.isLoading, isLoading) || redraw;

    if (isLoading) {
      return;
    }

    const oldLPData = this.props.landingPagesData;

    landingPagesData.forEach((lpData, lpId) => {
      const seriesItem = chart.get(this.toLandingPageSeriesId(lpId));
      if (!seriesItem && selectedLandingPages.has(lpId)) {
        chart.addSeries(this.getChartSeriesItem(lpData));
        redraw = true;
      } else if (seriesItem) {
        if (!selectedLandingPages.has(lpId)) {
          seriesItem.remove();
          redraw = true;
        } else if (
          this.isSeriesItemUpdated(oldLPData.has(lpId) && oldLPData.get(lpId).days, lpData.days)
        ) {
          seriesItem.remove();
          chart.addSeries(this.getChartSeriesItem(lpData));
        }
      }
    });

    if (redraw) {
      chart.redraw();
      this.updateTooltips();
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    return nextProps.shouldUpdate !== this.props.shouldUpdate;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  updateSeries = (chart: Object, isLoadingOld: boolean, isLoading: boolean) => {
    let redraw = false;
    if (isLoadingOld !== isLoading) {
      chart.series.forEach(series => {
        series.setVisible(!isLoading, false);
      });
      redraw = true;
    }

    return redraw;
  };

  toLandingPageSeriesId = (id: string | null) => `landing-page-series-item-${id || ''}`;

  getChartSeries = () => {
    const { showFake, landingPagesData } = this.props;

    if (showFake) {
      return this.fakeData.map(this.getChartSeriesItem);
    }

    return this.getNotesSeries().concat(
      (Array.from(landingPagesData.values()) || []).map(this.getChartSeriesItem),
    );
  };

  getNotesSeries = () => {
    const { notes } = this.props;
    const data = sortBy(
      uniqBy(notes, 'createdAt').map(({ createdAt }) => [new Date(createdAt).getTime(), 0]),
      noteData => noteData[0],
    );

    return notes
      ? [
          {
            id: notesSeriesName,
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
            showInLegend: false,
          },
        ]
      : [];
  };

  getPoints = days =>
    days.map(day => [new Date(day.date).getTime(), day.value]).sort((x, y) => x[0] - y[0]);

  getChartSeriesItem = (obj, idx = 0) => ({
    id: this.toLandingPageSeriesId(obj.landingPage.id),
    name: obj.landingPage.path,
    data: this.getPoints(obj.days),
    marker: {
      radius: 3,
      symbol: 'circle',
    },
    color: this.props.landingPagesColors[obj.landingPage.id] || colors[idx % colors.length],
    visible: true,
  });

  getTooltipsData = () => {
    if (!this.chart) {
      return [];
    }

    return this.chart
      .getChart()
      .series.filter(seriesItem => seriesItem.options.id !== notesSeriesName)
      .map(seriesItem => ({
        id: seriesItem.options.id,
        name: seriesItem.name,
      }));
  };

  fakeData = [
    {
      landingPage: {
        path: 'domain.com',
      },
      days: [...Array(9).keys()].map(item => ({
        date: `02-0${item + 1}-2018`,
        value: Math.floor(Math.random() * 10),
      })),
    },
  ];

  isSeriesItemUpdated = (oldDateValues, newDateValues) => {
    if (oldDateValues === newDateValues) {
      return false;
    }

    if (!oldDateValues || !newDateValues) {
      return oldDateValues !== newDateValues;
    }

    return (
      oldDateValues.length !== newDateValues.length ||
      !isEqual(this.getPoints(oldDateValues), this.getPoints(newDateValues))
    );
  };

  updateTooltips = () => {
    const tooltips = this.tooltips;
    setTimeout(() => this._isMounted && tooltips && tooltips.forceUpdate());
  };

  render() {
    const { period, notes, showFake, isLoading } = this.props;
    const self = this;
    const chartHeight = 200;
    const series = this.getChartSeries();

    const showNotes = notes && !showFake;

    const yAxis = [
      {
        title: null,
        top: showNotes ? '5%' : '0%',
        left: '60px',
        height: '100%',
        labels: {
          style: {
            whiteSpace: 'nowrap',
            textOverflow: 'none',
          },
        },
      },
    ];

    if (showNotes) {
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
        marginRight: 260,
        marginBottom: 30,
        marginLeft: 50,
        colorCount: 13,
        zoomType: 'xy',
        events: {
          load() {
            updateLoader(this, period, isLoading);
            self.updateTooltips();
            this.series.forEach(
              seriesItem =>
                self.state.visibility.get(seriesItem.options.id) === false &&
                seriesItem.update({
                  visible: false,
                }),
            );
          },
        },
      },
      lang: {
        noData: t('No landing page data for the selected period'),
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
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        y: 50,
        x: -20,
        width: 200,
        maxHeight: 220,
        useHTML: true,
        labelFormatter() {
          return `<div class="chart-legend-item-container">
            <span id="${this.options.id}" class="chart-legend-item">${this.name}</span>
          </div>`;
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
        zIndex: 2,
        positioner: function tooltipPositioner(labelWidth, labelHeight, point) {
          const p = this.getPosition(labelWidth, labelHeight, point);
          const maxX = this.chart.plotWidth + 80 - labelWidth;
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
          events: {
            legendItemClick: ({
              target: {
                visible,
                options: { id },
              },
            }) => {
              this.updateTooltips();
              this.setState({
                visibility: new Map([...this.state.visibility, ...new Map([[id, !visible]])]),
              });
            },
          },
        },
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

    return (
      <div className="landing-pages-chart">
        <div
          className="chart-area chart-content"
          ref={container => (this.exportContainer = container)}
        >
          <ExportButton content={() => this.exportContainer} />
          <Watermark big />
          <ReactHighcharts
            ref={chartRef => {
              this.chart = chartRef;
            }}
            config={config}
          />
          <HighchartsLegendTooltips
            ref={ref => {
              this.tooltips = ref;
            }}
            data={this.getTooltipsData}
          />
        </div>
      </div>
    );
  }
}

export default injectIntl(LandingPagesChart);
