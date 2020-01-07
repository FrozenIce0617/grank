// @flow
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const starKeywordsQuery = gql`
  mutation generic_starKeywords($input: UpdateKeywordsInput!) {
    updateKeywords(input: $input) {
      task {
        id
      }
    }
  }
`;

export const mutationStarKeywords = ({ withRef } = {}) =>
  graphql(starKeywordsQuery, {
    withRef,
    props: ({ mutate }) => ({
      starKeywords({ input }) {
        return mutate({
          variables: { input },
        });
      },
    }),
  });
