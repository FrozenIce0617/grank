// @flow
import React, { Component } from 'react';
import { t } from 'Utilities/i18n/index';
import './average-rank-chart.scss';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import NotesIcon from 'icons/content-note.svg';
import gql from 'graphql-tag';
import { isEmpty, sortBy, uniqBy, isEqual } from 'lodash';
import { updateLoader } from 'Components/HighchartsLoader';
import Watermark from 'Components/Watermark';
import { injectIntl, intlShape } from 'react-intl';
import LabelWithHelp from 'Components/LabelWithHelp';
import ReactHighcharts from 'react-highcharts';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { daysInPeriod } from 'Components/PeriodFilter/model';
import { subscribeToDomain } from 'Utilities/websocket';
import type { SubscriptionHandle } from 'Utilities/websocket';
import colorScheme from 'Utilities/colors';
import ExportButton from 'Components/ExportButton';
import { registerOverviewComponent, overviewComponentLoaded } from 'Actions/OverviewPageActions';
import { doAnyway } from 'Utilities/promise';

type Props = {
  data: Object,
  averageRank: Object,
  domainId: number,
  intl: intlShape,
  isLoading: boolean,
  period: number,
  notes: Object[],
  onNoteSelect: Function,
  onMultipleNotesSelect: Function,
  registerOverviewComponent: Function,
  overviewComponentLoaded: Function,
};

type State = {
  isSilentUpdate: boolean,
};

const notesColor = colorScheme.notes;
const notesSeriesName = 'notes';

class AverageRankChart extends Component<Props, State> {
  chart: ReactHighcharts;
  exportContainer: ?HTMLDivElement;
  _id: string = 'AverageRankChart';
  _subHandle: SubscriptionHandle;

  state = {
    isSilentUpdate: false,
  };

  componentDidMount() {
    this.props.registerOverviewComponent(this._id);

    this._subHandle = subscribeToDomain(this.handleUpdate);
  }

  componentDidUpdate(prevProps: Props) {
    const { period, isLoading } = this.props;
    if (!this.chart) {
      return;
    }

    const chart = this.chart.getChart();

    // Set is loading title for the chart
    if (
      (isLoading !== prevProps.isLoading || period !== prevProps.period) &&
      !this.state.isSilentUpdate
    ) {
      updateLoader(chart, period, isLoading);
    }

    if (prevProps.isLoading !== this.props.isLoading && !this.props.isLoading) {
      this.props.overviewComponentLoaded(this._id);
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      !isEqual(this.props.averageRank, nextProps.averageRank) ||
      (nextProps.isLoading !== this.props.isLoading && !nextState.isSilentUpdate)
    );
  }

  componentWillUnmount() {
    this._subHandle.unsubscribe();
  }

  handleUpdate = () => {
    this.setState({
      isSilentUpdate: true,
    });
    this.props.data.refetch().then(
      ...doAnyway(() => {
        this.setState({
          isSilentUpdate: false,
        });
      }),
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

  getChartRef = chartRef => {
    this.chart = chartRef;
  };

  render() {
    const { averageRank, period, isLoading, notes } = this.props;
    const avgRankPoints = averageRank
      ? averageRank.map(avgRank => ({
          x: new Date(avgRank.date).getTime(),
          y: Number(avgRank.amount.toFixed(2)),
        }))
      : [];

    const series = [];
    if (!isEmpty(avgRankPoints)) {
      series.push(...this.getNotesSeries(), {
        name: t('Average rank'),
        data: avgRankPoints,
        marker: {
          radius: 3,
          symbol: 'circle',
        },
        color: colorScheme.all.darkBlue,
        visible: true,
      });
    }

    const self = this;
    const chartHeight = 200;

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
        marginRight: 50,
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
      <div className="average-rank-chart">
        <LabelWithHelp
          helpTitle={t('Average Rank')}
          help={t('The average rank for all your keywords on the given date.')}
        >
          {t('Average Rank')}
        </LabelWithHelp>
        <div className="content">
          <div
            className="chart-area chart-content"
            ref={container => (this.exportContainer = container)}
          >
            <Watermark big offset />
            <ExportButton content={() => this.exportContainer} />
            <ReactHighcharts ref={this.getChartRef} config={config} />
          </div>
        </div>
      </div>
    );
  }
}

const averageRankQuery = gql`
  query averageRankChart_keywordsAverageRank(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        averageRank {
          date
          amount
        }
      }
    }
  }
`;

const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);

const mapStateToProps = state => {
  const periodFilter = periodFilterSelector(state);
  return {
    filters: state.filter.filterGroup.filters,
    period: periodFilter && daysInPeriod(periodFilter),
  };
};

export default injectIntl(
  compose(
    connect(
      mapStateToProps,
      { registerOverviewComponent, overviewComponentLoaded },
    ),
    graphql(averageRankQuery, {
      options: props => {
        const { filters } = props;
        return {
          fetchPolicy: 'network-only',
          variables: {
            filters,
            pagination: {
              page: 1,
              results: 25,
            },
            ordering: {
              order: 'ASC',
              orderBy: 'keyword',
            },
          },
        };
      },
      props: ({ ownProps, data, data: { loading, keywords } }) => ({
        ...ownProps,
        data,
        isLoading: loading,
        averageRank: keywords && keywords.overview ? keywords.overview.averageRank : [],
      }),
    }),
  )(AverageRankChart),
);
