// @flow
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const query = gql`
  query kpiSection_competitors(
    $filters: [FilterInput]!
    $fakePagination: PaginationInput!
    $fakeOrdering: OrderingInput!
  ) {
    keywords(filters: $filters, pagination: $fakePagination, ordering: $fakeOrdering) {
      competitors(pagination: $fakePagination, ordering: $fakeOrdering) {
        competitors {
          id
          domain
          faviconUrl
          displayName
        }
      }
    }
  }
`;

const competitorsQuery = () => {
  return graphql(query, {
    options: props => {
      const { filters } = props;
      return {
        fetchPolicy: 'network-only',
        variables: {
          filters,
          fakePagination: {
            page: 1,
            results: 25,
          },
          fakeOrdering: {
            order: 'ASC',
            orderBy: 'keyword',
          },
        },
      };
    },
    props: ({ ownProps, data: { loading, error, refetch, keywords } }) => {
      const data = keywords && keywords.competitors ? keywords.competitors.competitors : [];

      return {
        ...ownProps,
        competitors: data,
      };
    },
  });
};

export default competitorsQuery;
