// @flow
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { t } from 'Utilities/i18n/index';
import { competitorValuesFragment, valuesFragment } from './fragments';
import { formatData, defaultFetchParams } from './formatData';

const query = gql`
  query kpiSection_analyticsVisitors(
    $filters: [FilterInput]!
    $getCompetitors: Boolean!
    $competitors: [ID]!
    $fakePagination: PaginationInput!
    $fakeOrdering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      overview {
        graphs {
          analyticsVisitors(competitors: $competitors) {
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

const analyticsVisitorsQuery = () => {
  return graphql(query, {
    options: props => defaultFetchParams(props),
    props: ({ ownProps, data }) => {
      const key = 'analyticsVisitors';
      const name = t('Organic traffic (Analytics)');

      const { returnProps } = formatData({ ownProps, data, key, name });

      return returnProps;
    },
  });
};

export default analyticsVisitorsQuery;
