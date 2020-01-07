// @flow
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import Skeleton from 'Components/Skeleton';
import gql from 'graphql-tag';

type PageData = {
  id: string,
  path: string,
};

type Props = {
  pagesIds: string[],
  loading: boolean,
  error: string,
  landingPages: PageData[],
};

class LandingPagesLabel extends React.Component<Props> {
  render() {
    if (this.props.loading || this.props.error) {
      return (
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '120px', marginBottom: '10px' } }]}
        />
      );
    }
    const landingPages = this.props.landingPages;
    return <span>{landingPages.map(landingPage => landingPage.path).join(', ')}</span>;
  }
}

const landingPagesQuery = gql`
  query landingPagesLabel_getLandingPages($ids: [ID]!) {
    landingPages(ids: $ids) {
      id
      path
    }
  }
`;

export default compose(
  graphql(landingPagesQuery, {
    options: (props: Props) => ({
      variables: {
        ids: props.pagesIds,
      },
    }),
    props: ({ data: { error, loading, landingPages } }) => ({
      error,
      loading,
      landingPages,
    }),
  }),
)(LandingPagesLabel);
