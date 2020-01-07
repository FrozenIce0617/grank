// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { hideModal } from 'Actions/ModalAction';
import { withApollo, compose, graphql } from 'react-apollo';
import Chart from '../Chart';
import { RequiredFiltersSelector } from 'Selectors/FiltersSelector';
import SpecificFilterSelector from 'Selectors/SpecificFilterSelector';
import { FilterAttribute } from 'Types/Filter';
import { daysInPeriod } from 'Components/PeriodFilter/model';

type Props = {
  filters: any,
  keywords: Object[],
  keywordsData: Object,
  hideModal: Function,
  period: number,
};

type State = {
  keywordsRanks: Object,
};

class KeywordComparisonChartContainer extends Component<Props, State> {
  state = {
    keywordsRanks: {},
  };

  render() {
    const { keywordsData, period } = this.props;
    return (
      <Chart isLoading={keywordsData.loading} period={period} keywordsObj={keywordsData.keywords} />
    );
  }
}

const keywordsQuery = gql`
  query keywordHistoryChartContainer_keywordsRanks(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keywords {
        id
        keyword
        domain {
          id
          domain
        }
        ranks(competitors: []) {
          id
          rank
          searchDate
        }
      }
    }
  }
`;

const periodFilterSelector = SpecificFilterSelector(FilterAttribute.PERIOD);

const mapStateToProps = state => {
  const periodFilter = periodFilterSelector(state);
  return {
    filters: RequiredFiltersSelector(state),
    period: periodFilter && daysInPeriod(periodFilter),
  };
};

export default compose(
  withApollo,
  connect(
    mapStateToProps,
    { hideModal },
  ),
  graphql(keywordsQuery, {
    name: 'keywordsData',
    options: props => {
      const { filters, keywords } = props;
      const _filters = [
        ...filters,
        {
          attribute: 'keywords',
          type: 'list',
          comparison: 'contains',
          value: JSON.stringify(keywords.map(keyword => +keyword.id)),
        },
      ];
      return {
        fetchPolicy: 'network-only',
        variables: {
          filters: _filters,
          pagination: {
            page: 1,
            results: keywords.length,
          },
          ordering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
        },
      };
    },
  }),
)(KeywordComparisonChartContainer);
