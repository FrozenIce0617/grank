// @flow
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import Skeleton from 'Components/Skeleton';
import gql from 'graphql-tag';

type ClientData = {
  id: string,
  name: string,
};

type Props = {
  clientsIds: string[],
  loading: boolean,
  error: string,
  clients: ClientData[],
};

class ClientsLabel extends React.Component<Props> {
  render() {
    if (this.props.loading || this.props.error) {
      return (
        <Skeleton
          linesConfig={[{ type: 'text', options: { width: '120px', marginBottom: '10px' } }]}
        />
      );
    }
    const clientsMap = this.props.clients.reduce((acc, client) => {
      acc[client.id] = client;
      return acc;
    }, {});
    const clients = this.props.clientsIds.reduce((acc, clientId) => {
      const client = clientsMap[clientId];
      if (client) {
        acc.push(client);
      }
      return acc;
    }, []);
    return <span>{clients.map(client => client.name).join(', ')}</span>;
  }
}

const clientsQuery = gql`
  query clientsLabel_clients {
    clients {
      id
      name
    }
  }
`;

export default compose(
  graphql(clientsQuery, {
    props: ({ data: { error, loading, clients } }) => ({
      error,
      loading,
      clients,
    }),
  }),
)(ClientsLabel);
