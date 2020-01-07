// @flow
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { t } from 'Utilities/i18n/index';
import { competitorValuesFragment, valuesFragment } from './fragments';
import { formatData, defaultFetchParams } from './formatData';

const query = gql`
  query kpiSection_searchVolume(
    $filters: [FilterInput]!
    $getCompetitors: Boolean!
    $competitors: [ID]!
    $fakePagination: PaginationInput!
    $fakeOrdering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      overview {
        graphs {
          searchVolume(competitors: $competitors) {
            competitorValues @include(if: $getCompetitors) {
              ...competitorValuesProps
            }
            values {
              ...valuesProps
            }
          }
        }
      }
    }
  }
  ${competitorValuesFragment}
  ${valuesFragment}
`;

const searchVolumeQuery = () => {
  return graphql(query, {
    options: props => defaultFetchParams(props),
    props: ({ ownProps, data }) => {
      const key = 'searchVolume';
      const name = t('Search volume');

      const { kpi, competitorValues, returnProps } = formatData({ ownProps, data, key, name });

      return returnProps;
    },
  });
};

export default searchVolumeQuery;
