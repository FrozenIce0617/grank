// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { hideModal } from 'Actions/ModalAction';
import ModalBorder from 'Components/Modal/Layout/ModalBorder';
import { t } from 'Utilities/i18n';
import './search-volume.scss';
import Chart from './Chart';
import moment from 'moment';
import { RequiredFiltersSelector } from 'Selectors/FiltersSelector';
import { sortBy } from 'lodash';
import { graphqlError, graphqlLoading } from 'Utilities/underdash';

type Props = {
  hideModal: Function,
  keywordId: string,
  keyword: string,
  keywordHistoryData: Object,
};

class SearchVolume extends Component<Props> {
  fakeData() {
    return sortBy(
      [...Array(10).keys()].map((v, index) => {
        const date = moment().subtract(index, 'days');
        return { date, volume: Math.floor(Math.random() * 100 + 1) };
      }),
      'date',
    );
  }

  render() {
    const { keyword, keywordHistoryData } = this.props;
    let keywordHistory = null;
    if (!graphqlError({ ...this.props }) && !graphqlLoading({ ...this.props })) {
      keywordHistory = keywordHistoryData.keywords.keywords[0].searchVolume.history;
    }
    return (
      <ModalBorder
        className="search-volume-modal"
        title={`${t('Search Volume History for ')} ${keyword}`}
        onClose={this.props.hideModal}
      >
        <Chart data={keywordHistory} watermark watermarkBig />
      </ModalBorder>
    );
  }
}

const getKeywordData = gql`
  query searchVolume_keywordsSearchVolume(
    $filters: [FilterInput]!
    $pagination: PaginationInput!
    $ordering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $pagination, ordering: $ordering) {
      keywords {
        id
        searchVolume {
          id
          history {
            month
            volume
          }
        }
      }
    }
  }
`;

const mapStateToProps = state => ({
  filters: RequiredFiltersSelector(state),
});

export default compose(
  connect(
    mapStateToProps,
    { hideModal },
  ),
  graphql(getKeywordData, {
    name: 'keywordHistoryData',
    options: props => {
      const { filters } = props;
      const newFilters = [
        ...filters,
        {
          attribute: 'keywords',
          type: 'list',
          comparison: 'contains',
          value: `[${props.keywordId}]`,
        },
      ];
      return {
        fetchPolicy: 'network-only',
        variables: {
          filters: newFilters,
          pagination: {
            page: 1,
            results: 10,
          },
          ordering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
        },
      };
    },
  }),
)(SearchVolume);
