// @flow
import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n/index';
import type { FilterBase } from 'Types/Filter';
import CompetitorsRankDistributionChart from './Chart';
import colorScheme from 'Utilities/colors';

const colors = colorScheme.unknownCompetitors.competitors;
const ownColor = colorScheme.unknownCompetitors.own;

type Props = {
  client: Object,
  isLoading: boolean,
  showFake: boolean,
  filters: FilterBase[],
  period: number,
  selection: Set<number>,
  competitors: any[],
};

type State = {
  isLoading: boolean,
  chartData: any[],
};

const competitorsRankDistributionQuery = gql`
  query competitorsRankDistribution_unknownCompetitorRankDistribution(
    $competitors: [ID]!
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        unknownCompetitorRankDistribution(ids: $competitors) {
          ownDomain
          unknownCompetitor {
            id
            domain
          }
          ranks {
            rank
            amount
          }
        }
      }
    }
  }
`;

class CompetitorsRankDistribution extends Component<Props, State> {
  state = {
    isLoading: false,
    chartData: [],
  };

  componentDidMount() {
    this.queryData();
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.filters !== this.props.filters ||
      this.props.selection !== prevProps.selection ||
      this.props.showFake !== prevProps.showFake
    ) {
      this.queryData();
    }
  }

  fakeChartData = [
    {
      name: t('domain1.com'),
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 17 },
        { x: 3, y: 2 },
        { x: 4, y: 37 },
        { x: 5, y: 11 },
        { x: 6, y: 5 },
        { x: 7, y: 19 },
        { x: 8, y: 30 },
        { x: 9, y: 21 },
        { x: 10, y: 8 },
      ],
    },
  ];

  makeChartSeries = (data: any[]) => {
    const competitors = this.props.competitors.filter(competitor =>
      this.props.selection.has(competitor.id),
    );

    return data.map(competitorRanksData => {
      const competitorSeria = competitors.filter(
        competitor => competitor.id === competitorRanksData.unknownCompetitor.id,
      );

      return {
        color: competitorRanksData.ownDomain
          ? ownColor
          : competitorSeria[0]
            ? competitorSeria[0].color
            : colors[0],
        name: competitorRanksData.unknownCompetitor.domain,
        data: competitorRanksData.ranks.map(rankData => ({
          name: t('Number of keywords ranking at rank: %s', rankData.rank),
          x: rankData.rank,
          y: rankData.amount,
        })),
        marker: {
          symbol: 'circle',
          radius: 3,
        },
      };
    });
  };

  queryData = () => {
    const { client, filters, selection, showFake } = this.props;
    if (showFake) {
      this.setState({
        isLoading: false,
        chartData: this.fakeChartData,
      });
      return;
    }
    if (selection.size === 0) {
      this.setState({
        isLoading: false,
        chartData: [],
      });
      return;
    }
    this.setState({
      isLoading: true,
    });
    return client
      .query({
        query: competitorsRankDistributionQuery,
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
          competitors: Array.from(this.props.selection),
        },
      })
      .then(({ data }) => {
        const {
          keywords: {
            overview: { unknownCompetitorRankDistribution },
          },
        } = data;

        this.setState({
          chartData: this.makeChartSeries(unknownCompetitorRankDistribution),
          isLoading: false,
        });
      })
      .catch(error => {
        this.setState({ isLoading: false });
        throw error;
      });
  };

  render() {
    const { chartData } = this.state;
    return (
      <CompetitorsRankDistributionChart
        data={chartData}
        isLoading={this.props.isLoading || this.state.isLoading}
        period={this.props.period}
      />
    );
  }
}

export default withApollo(CompetitorsRankDistribution);
