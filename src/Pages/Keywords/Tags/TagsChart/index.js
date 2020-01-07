//@flow
import React, { Component } from 'react';
import './tags-chart.scss';
import { t } from 'Utilities/i18n/index';
import { injectIntl, intlShape } from 'react-intl';
import Watermark from 'Components/Watermark';
import { isEqual, uniqueId, sortBy, uniqBy } from 'lodash';
import { updateLoader } from 'Components/HighchartsLoader';
import HighchartsLegendTooltips from 'Components/HighchartsLegendTooltips';
import ReactHighcharts from 'react-highcharts';
import ExportButton from 'Components/ExportButton';
import NotesIcon from 'icons/content-note.svg';
import colorScheme from 'Utilities/colors';

const colors = colorScheme.defaultLines;

type Props = {
  selectedTags: Set<string | null>,
  tagsData: Map<string | null, Object>,
  tagsColors: { [key: string]: string },
  isLoading: boolean,
  period: number,
  intl: intlShape,
  shouldUpdate: number,
  showFake: boolean,
  notes: Object[],
  onNoteSelect: Function,
  onMultipleNotesSelect: Function,
};

type State = {
  visibility: Map<string | null, Object>,
};

const notesColor = colorScheme.notes;
const notesSeriesName = 'notes';

class TagsChart extends Component<Props, State> {
  chart: ReactHighcharts;
  exportContainer: ?HTMLDivElement;
  tooltips: HighchartsLegendTooltips | null = null;
  tagIdMap = {};
  _isMounted: boolean = false;

  state = {
    visibility: new Map(),
  };

  componentDidMount() {
    this._isMounted = true;
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    this.updateIdMap(nextProps);

    if (!this.chart || nextProps.showFake) {
      return;
    }

    const chart = this.chart.getChart();
    const { tagsData, period, isLoading, selectedTags } = nextProps;

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

    const oldTagsData = this.props.tagsData;

    tagsData.forEach((tagData, tagName) => {
      const seriesItem = chart.get(this.toTagSeriesId(tagName));
      if (!seriesItem && selectedTags.has(tagName)) {
        chart.addSeries(this.getChartSeriesItem(tagData));
        redraw = true;
      } else if (seriesItem) {
        if (!selectedTags.has(tagName)) {
          seriesItem.remove();
          redraw = true;
        } else if (
          this.isSeriesItemUpdated(
            oldTagsData.has(tagName) && oldTagsData.get(tagName).days,
            tagData.days,
          )
        ) {
          seriesItem.remove();
          chart.addSeries(this.getChartSeriesItem(tagData));
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

  getChartSeries = () => {
    const { showFake, tagsData } = this.props;

    if (showFake) {
      return this.fakeData.map(this.getChartSeriesItem);
    }

    return this.getNotesSeries().concat(
      (Array.from(tagsData.values()) || []).map(this.getChartSeriesItem),
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
    id: this.toTagSeriesId(obj.tag),
    name: obj.tag,
    data: this.getPoints(obj.days),
    marker: {
      radius: 3,
      symbol: 'circle',
    },
    color: this.props.tagsColors[obj.tag] || colors[idx % colors.length],
    visible: true,
  });

  getChartRef = ref => {
    this.chart = ref;
  };

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
      tag: 'Development',
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

  toTagSeriesId = (tag: string | null) => `tag-series-item-${tag ? this.tagIdMap[tag] : ''}`;

  updateTooltips = () => {
    const tooltips = this.tooltips;
    setTimeout(() => this._isMounted && tooltips && tooltips.forceUpdate());
  };

  updateIdMap = props => {
    const { tagsData } = props;
    tagsData.forEach((tagData, tagName) => {
      if (!tagName) {
        return;
      }

      if (!this.tagIdMap[tagName]) {
        this.tagIdMap[tagName] = uniqueId();
      }
    });
  };

  render() {
    const { period, notes, showFake, isLoading } = this.props;
    const self = this;
    const chartHeight = 200;

    const showNotes = notes && !showFake;

    const yAxis = [
      {
        title: null,
        top: showNotes ? '5%' : '0%',
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
                self.state.visibility.get(seriesItem.name) === false &&
                seriesItem.update({
                  visible: false,
                }),
            );
          },
        },
      },
      lang: {
        noData: t('No tag cloud data for the selected period'),
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
      series: this.getChartSeries(),
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
          const maxX = this.chart.plotWidth + 100 - labelWidth;
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
            x: -240,
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
      <div className="tags-chart">
        <div
          className="chart-area chart-content"
          ref={container => (this.exportContainer = container)}
        >
          <ExportButton content={() => this.exportContainer} />
          <Watermark big />
          <ReactHighcharts ref={this.getChartRef} config={config} />
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

export default injectIntl(TagsChart);
