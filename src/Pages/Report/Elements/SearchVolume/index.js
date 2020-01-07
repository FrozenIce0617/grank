// @flow
import * as React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { t } from 'Utilities/i18n';
import type { FilterBase } from 'Types/Filter';
import ElementsHeader from '../../ElementHeader';
import Chart from 'Components/Modal/Content/SearchVolume/Chart';

type Props = {
  onLoad: Function,
  loading: boolean,
  filters: FilterBase[],
  keywordsHistory: Object[],
};

class SearchVolume extends React.Component<Props> {
  render() {
    if (this.props.loading) {
      return null;
    }
    this.props.onLoad();
    return (
      <div className="total-search-volume">
        <ElementsHeader title={t('Total search volume')} />
        <Chart data={this.props.keywordsHistory} />
      </div>
    );
  }
}

const searchVolumeQuery = gql`
  query searchVolume_searchVolume(
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
    keywordsHistory: keywords ? keywords.keywords[0].searchVolume.history : [],
  }),
})(SearchVolume);
