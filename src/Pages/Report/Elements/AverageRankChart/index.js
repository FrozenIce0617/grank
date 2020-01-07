// @flow
import * as React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import type { FilterBase } from 'Types/Filter';
import ReportLineChart from 'Components/ReportLineChart';
import ElementsHeader from '../../ElementHeader';
import './report-average-rank.scss';
import { isEmpty } from 'lodash';
import colorScheme from 'Utilities/colors';

type Props = {
  onLoad: Function,
  loading: boolean,
  filters: FilterBase[],
  averageRanks: Object[],
};

class AverageRank extends React.Component<Props> {
  render() {
    if (this.props.loading) {
      return null;
    }
    this.props.onLoad();

    const avgRankPoints = this.props.averageRanks.map(averageRank => ({
      x: new Date(averageRank.date).getTime(),
      y: averageRank.amount,
    }));

    const series = [];
    if (!isEmpty(avgRankPoints)) {
      series.push({
        name: t('Average rank'),
        points: avgRankPoints,
        color: colorScheme.averageRank,
      });
    }
    return (
      <div className="report-average-rank">
        <ElementsHeader title={t('Average rank')} filters={this.props.filters} />
        <ReportLineChart
          series={series}
          reverseY={true}
          animation={false}
          noDataMessage={t('No average rank data for the selected period')}
        />
      </div>
    );
  }
}

const searchVolumeQuery = gql`
  query averageRank_averageRank(
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

export default graphql(searchVolumeQuery, {
  options: (props: Props) => {
    const { filters } = props;
    return {
      fetchPolicy: 'network-only',
      variables: {
        filters,
        pagination: {
          page: 1,
          results: 100,
        },
        ordering: {
          order: 'ASC',
          orderBy: 'keyword',
        },
      },
    };
  },
  props: ({ ownProps, data: { loading, keywords } }) => ({
    ...ownProps,
    loading,
    averageRanks: keywords && keywords.overview ? keywords.overview.averageRank : [],
  }),
})(AverageRank);
