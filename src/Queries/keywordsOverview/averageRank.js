// @flow
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { t } from 'Utilities/i18n/index';
import { competitorValuesFragment, valuesFragment } from './fragments';
import { formatData, defaultFetchParams } from './formatData';

const query = gql`
  query kpiSection_averageRank(
    $filters: [FilterInput]!
    $getCompetitors: Boolean!
    $competitors: [ID]!
    $fakePagination: PaginationInput!
    $fakeOrdering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      overview {
        graphs {
          averageRank(competitors: $competitors) {
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

const averageRankQuery = () => {
  return graphql(query, {
    options: props => defaultFetchParams(props),
    props: ({ ownProps, data }) => {
      const key = 'averageRank';
      const name = t('Average rank');

      const { kpi, returnProps } = formatData({ ownProps, data, key, name });

      const customKpi = {
        ...kpi,
        both: {
          ...kpi.both,
          value: kpi.both.value / 2, // device+mobile/2
        },
      };

      return {
        ...returnProps,
        kpis: {
          ...returnProps.kpis,
          [key]: {
            ...returnProps.kpis[key],
            kpi: customKpi,
          },
        },
      };
    },
  });
};

export default averageRankQuery;
