// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import linkToKeywordListFromChart from 'Components/Filters/LinkToKeywordListFromChart';
import { t } from 'Utilities/i18n';
import { isEmpty, isEqual, sortBy, uniqBy } from 'lodash';
import { injectIntl, intlShape } from 'react-intl';
import moment, { utc } from 'moment';
import Watermark from 'Components/Watermark';
import NotesIcon from 'icons/content-note.svg';
import { updateLoader } from 'Components/HighchartsLoader';
import colorScheme from 'Utilities/colors';
import ReactHighcharts from 'react-highcharts';
import ExportButton from 'Components/ExportButton';

type Rank = {
  searchDate: string,
  rank: number,
};

const notesColor = colorScheme.notes;
const notesSeriesName = 'notes';

const mainColors = [
  colorScheme.deviceType.desktop,
  colorScheme.deviceType.mobile,
  colorScheme.deviceType.all,
];

export type CompetitorsVisibility = { [id: string]: boolean };
export type CompetitorColors = { [id: string]: string };

export type SeriesVisibility = {
  domainVisibility: boolean,
};

type SeriesDataItem = {
  id: string,
  searchDate: any,
  rank: number,
};

type Competitor = {
  data: SeriesDataItem[],
  domain: string,
};

type CompetitorsData = { [id: string]: Competitor };

type Props = {
  domainId?: number,
  domain?: string,
  competitorsData?: CompetitorsData,
  notes: Object[],
  onNoteSelect: Function,
  onMultipleNotesSelect: Function,
  data: SeriesDataItem[],
  height: any,
  customWrapper: boolean,
  competitorsVisibility?: CompetitorsVisibility,
  competitorColors?: CompetitorColors,
  history: Object,
  intl: intlShape,
  period: number,
  watermark: boolean,
  watermarkBig: boolean,
  isLoading: boolean,
  exportContainer: any,
  showPercentage: boolean,
  domainVisibility: boolean,
};

class Chart extends Component<Props, State> {
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

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (!this.chart) {
      return;
    }

    const chart = this.chart.getChart();
    const {
      competitorsData: oldCompetitorsData,
      notes: oldNotes,
      domainVisibility: oldDomainVisibility,
    } = this.props;
    const {
      competitorsVisibility,
      competitorsData,
      isLoading,
      period,
      notes,
      domainVisibility,
    } = nextProps;

    // Set is loading title for the chart
    if (isLoading !== this.props.isLoading || period !== this.props.period) {
      updateLoader(chart, period, isLoading);
    }

    let redraw = this.updateNotesSeries(chart, oldNotes, notes);
    redraw =
      this.updateMainSeries(
        chart,
        oldDomainVisibility,
        domainVisibility,
        this.props.isLoading,
        isLoading,
      ) || redraw;
    redraw =
      this.updateCompetitorsSeries(
        chart,
        isLoading ? {} : competitorsVisibility,
        oldCompetitorsData,
        competitorsData,
      ) || redraw;

    // Redraw if the data or visibility were updated
    if (redraw) {
      chart.redraw();
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    return !isEqual(nextProps.data, this.props.data);
  }

  addCompetitorSeries = (
    chart: Object,
    competitorId: string,
    competitorIndex: number,
    competitorData?: Competitor,
    competitorsVisibility: CompetitorsVisibility,
  ) => {
    competitorData &&
      this.toChartSeries(
        this.getCompetitorSeriesConfig(
          competitorId,
          competitorIndex,
          competitorData,
          competitorsVisibility,
        ),
      ).forEach(config => chart.addSeries(config));
  };

  reAddCompetitorSeries = (
    chart: Object,
    competitorId: string,
    competitorIndex: number,
    competitorData?: Competitor,
    competitorsVisibility: CompetitorsVisibility,
  ) => {
    // Remove all competitor series
    while (chart.get(competitorId)) {
      chart.get(competitorId).remove();
    }

    // Add new competitor series
    this.addCompetitorSeries(
      chart,
      competitorId,
      competitorIndex,
      competitorData,
      competitorsVisibility,
    );
  };

  updateCompetitorsSeries = (
    chart: Object,
    competitorsVisibility: CompetitorsVisibility = {},
    oldCompetitorsData?: CompetitorsData = {},
    newCompetitorsData?: CompetitorsData = {},
  ) => {
    let redraw = false;
    if (isEmpty(newCompetitorsData)) {
      return redraw;
    }

    const competitors = Object.keys(newCompetitorsData);
    competitors.forEach((competitorId: string, competitorIndex) => {
      const chartItem = chart.get(competitorId);

      if (!chartItem) {
        // Add competitor series if no series with competitorId are presented
        this.addCompetitorSeries(
          chart,
          competitorId,
          competitorIndex,
          newCompetitorsData && newCompetitorsData[competitorId],
          competitorsVisibility,
        );
        redraw = true;
      } else {
        const oldSeriesData = oldCompetitorsData[competitorId].data;
        const newSeriesData = newCompetitorsData[competitorId].data;

        // Check if the data is updated for the series with given competitorId
        // if (this.isDataUpdated(oldSeriesData, newSeriesData)) {
        if (!isEqual(oldSeriesData, newSeriesData)) {
          this.reAddCompetitorSeries(
            chart,
            competitorId,
            competitorIndex,
            newCompetitorsData && newCompetitorsData[competitorId],
            competitorsVisibility,
          );
          redraw = true;
          return;
        }

        // Update visibility if visibility has changed
        const isVisible = competitorsVisibility[competitorId];
        const seriesItem = chart.series[chartItem.index];

        if (isVisible !== seriesItem.isVisible) {
          seriesItem.setVisible(isVisible, false);
          redraw = true;
        }
      }
    });
    return redraw;
  };

  updateMainSeries = (
    chart: Object,
    oldVisibility: Boolean,
    visibility: Boolean,
    isLoadingOld: boolean,
    isLoading: boolean,
  ) => {
    let redraw = false;
    if (isLoadingOld !== isLoading) {
      chart.series.forEach(series => {
        series.setVisible(!isLoading, false);
      });
      redraw = true;
    } else if (oldVisibility !== visibility) {
      chart.series.forEach(series => {
        series.setVisible(visibility, false);
      });
      redraw = true;
    }

    return redraw;
  };

  updateNotesSeries = (chart: Object, oldNotes: Object[], notes: Object[]) => {
    if (!isEqual(oldNotes, notes)) {
      const notesSeriesItem = chart.get(notesSeriesName);
      notesSeriesItem.setData(this.getNotesSeriesData(notes));
      return true;
    }
  };

  getChartConfig = () => {
    const self = this;
    const { height: chartHeight, notes, period, isLoading } = this.props;
    const series = this.getChartSeries();

    const yAxis = [
      {
        title: null,
        top: notes ? '5%' : '0%',
        height: '100%',
        reversed: true,
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
        height: 370,
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
        headerFormat: `<div class="chart-tooltip-table">
            <div class="chart-tooltip-table-tr">
              <div class="chart-tooltip-table-th">{point.key}</div>
            </div>
          `,
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
                  </div>
                `;
        },
        footerFormat: '</div>',
        xDateFormat: '%b %e, %Y',
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
                } = this.props;
                const {
                  series: { name },
                  category,
                } = evt.point;
                if (name === notesSeriesName) {
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
        noData: t('No average rank data for the selected period'),
      },
    };
  };

  getCompetitorSeriesConfig = (competitorId, idx, competitorData, competitorsVisibility) => {
    const { domain, data } = competitorData;
    const isVisible = !!competitorsVisibility[competitorId];

    return [
      {
        id: competitorId,
        name: `${domain}`,
        seriesItemData: data,
        index: idx,
        visibility: isVisible,
        isCompetitor: true,
      },
    ];
  };

  getCompetitorsSeriesConfig = () => {
    const { competitorsData, competitorsVisibility = {} } = this.props;
    return competitorsData
      ? Object.keys(competitorsData).reduce((acc, competitorId, idx) => {
          acc.push(
            ...this.getCompetitorSeriesConfig(
              competitorId,
              idx,
              competitorsData[competitorId],
              competitorsVisibility,
            ),
          );
          return acc;
        }, [])
      : [];
  };

  getMainSeriesConfig = () => {
    const { data, domain } = this.props;
    return [
      {
        name: domain,
        seriesItemData: data,
        visibility: true,
      },
    ];
  };

  getNotesSeriesData = notes =>
    sortBy(
      uniqBy(notes, 'createdAt').map(({ createdAt }) => [new Date(createdAt).getTime(), 0]),
      noteData => noteData[0],
    );

  getNotesSeries = () => {
    const { notes } = this.props;
    return notes
      ? [
          {
            id: notesSeriesName,
            name: notesSeriesName,
            yAxis: 1,
            data: this.getNotesSeriesData(notes),
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

  getChartRef = chartRef => {
    this.chart = chartRef;
  };

  getChartSeries = () =>
    this.toChartSeries(this.getMainSeriesConfig().concat(this.getCompetitorsSeriesConfig())).concat(
      this.getNotesSeries(),
    );

  generateSeriesItemConfig = ({
    id,
    name,
    symbol,
    seriesItemData,
    index,
    visibility: visible,
    isCompetitor = false,
  }) => {
    const { competitorColors } = this.props;
    const color =
      isCompetitor && competitorColors
        ? competitorColors[id]
        : mainColors[index % mainColors.length];

    const data = seriesItemData
      .filter(
        (item: Rank) =>
          !!item && typeof item.rank === 'number' && item.rank !== -1 && item.searchDate,
      )
      .map(item => [
        utc(item.searchDate)
          .startOf('day')
          .valueOf(),
        item.rank,
      ]);
    return {
      id,
      name,
      color,
      className: isCompetitor ? 'competitor-seria' : 'current-seria',
      marker: {
        symbol,
        radius: 3,
      },
      data,
      visible,
    };
  };

  toChartSeries = (seriesConfig: Array<any>) => {
    return seriesConfig.reduce(
      (
        acc,
        { id, name, symbol = 'circle', seriesItemData, index, visibility, isCompetitor },
        idx,
      ) => {
        if (seriesItemData) {
          acc.push(
            this.generateSeriesItemConfig({
              id,
              name,
              symbol,
              seriesItemData,
              index: index != null ? index : idx,
              visibility,
              isCompetitor,
            }),
          );
        }
        return acc;
      },
      [],
    );
  };

  wrapChart = chart =>
    !this.props.customWrapper ? (
      <div className="chart-container">
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
