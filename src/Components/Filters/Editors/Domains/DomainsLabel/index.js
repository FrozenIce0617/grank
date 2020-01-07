// @flow
import * as React from 'react';
import { graphql } from 'react-apollo';
import Skeleton from 'Components/Skeleton';
import { graphqlOK } from 'Utilities/underdash';
import gql from 'graphql-tag';

import { formatDomain } from 'Utilities/format';

type Props = {
  domainIds: string[],
  data: Object,
};

class DomainsLabel extends React.Component<Props> {
  render() {
    if (!graphqlOK(this.props)) {
      return (
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '120px', marginBottom: '10px' } }]}
        />
      );
    }

    const {
      data: { domainsList: domains },
      domainIds,
    } = this.props;
    const domainsMap = domains.reduce((acc, domain) => {
      acc[domain.id] = domain;
      return acc;
    }, {});
    return <span>{domainIds.map(domainId => formatDomain(domainsMap[domainId])).join(', ')}</span>;
  }
}

const domainsQuery = gql`
  query domainsLabel_domainsList {
    domainsList {
      id
      domain
      displayName
    }
  }
`;

export default graphql(domainsQuery)(DomainsLabel);
