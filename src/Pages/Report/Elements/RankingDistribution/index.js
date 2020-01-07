// @flow
import * as React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import type { FilterBase } from 'Types/Filter';
import Chart from 'Pages/KeywordsOverview/RankingDistribution/Chart';
import ElementsHeader from '../../ElementHeader';

type Props = {
  onLoad: Function,
  loading: boolean,
  filters: FilterBase[],
  rankingDistribution: Object,
};

class RankingDistribution extends React.Component<Props> {
  render() {
    if (this.props.loading) {
      return null;
    }
    this.props.onLoad();
    return (
      <div className="ranking-distribution">
        <ElementsHeader title={t('Ranking distribution')} filters={this.props.filters} />
        <Chart animate={false} data={this.props.rankingDistribution} />
      </div>
    );
  }
}

const rankingDistributionQuery = gql`
  query rankingDistribution_rankingDistribution(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      overview {
        rankingDistribution {
          days {
            date
            keywords0To3
            keywords4To10
            keywords11To20
            keywords21To50
            keywordsAbove50
            keywordsUnranked
            keywordsTotal
          }
        }
      }
    }
  }
`;

export default graphql(rankingDistributionQuery, {
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
    rankingDistribution: keywords && keywords.overview ? keywords.overview.rankingDistribution : {},
  }),
})(RankingDistribution);
